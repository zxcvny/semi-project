from fastapi import (
    APIRouter, Depends, HTTPException, status, Response, 
    UploadFile, File, Form
)

from sqlalchemy.orm import Session
from typing import List
from uuid import uuid4
import os
import shutil

from database import get_db
from schemas import product_schema
from models import user_model
import crud
import auth

router = APIRouter()

# 이미지 저장 경로
UPLOAD_DIR = "../static/product_images"
os.makedirs(UPLOAD_DIR, exist_ok=True) # 없으면 자동 생성

def save_image(upload_file: UploadFile) -> str:
    """업로드된 이미지를 저장하고 파일 경로 반환"""
    extension = upload_file.filename.split(".")[-1]
    unique_filename = f"{uuid4()}.{extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return f"../static/product_images/{unique_filename}"

@router.get("", response_model=List[product_schema.ProductResponse])
def read_products(
    skip: int = 0,
    limit: int = 16,
    db: Session = Depends(get_db)
):
    """상품 전체 목록 조회"""
    products = crud.get_all_product(db, skip=skip, limit=limit)
    return products

@router.post("/", response_model=product_schema.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    title: str = Form(...),
    content: str = Form(...),
    price: int = Form(...),
    category_id: int = Form(...),
    representative_image_index: int = Form(..., description="대표 이미지의 순서 (0부터 시작)"),
    images: List[UploadFile] = File(..., description="상품 이미지 (최소 1장, 최대 10장)"),
    trade_city: str = Form(None),
    trade_district: str = Form(None),
    product_tag: product_schema.ProductTag = Form(product_schema.ProductTag.NONE),
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user)
):
    """새상품 등록"""
    # 이미지 개수 확인
    if not (1 <= len(images) <= 10):
        raise HTTPException(status_code=400, detail="이미지는 1장 이상 10장 이하로 업로드해야 합니다.")
    
    # 대표 이미지 인덱스 유효성 확인
    if not (0 <= representative_image_index < len(images)):
        raise HTTPException(status_code=400, detail="유효하지 않은 대표 이미지 순서입니다.")
        
    # 카테고리 존재 확인
    if not crud.get_category(db, category_id=category_id):
        raise HTTPException(status_code=404, detail="해당 카테고리를 찾을 수 없습니다.")

    image_schemas = []
    for index, image_file in enumerate(images):
        image_url = save_image(image_file)
        is_rep = (index == representative_image_index)
        image_schemas.append(product_schema.ProductImageCreate(image_url=image_url, is_representative=is_rep))

    product_data = product_schema.ProductCreate(
        title=title, content=content, price=price, category_id=category_id,
        trade_city=trade_city, trade_district=trade_district, product_tag=product_tag,
        images=image_schemas
    )

    return crud.create_product(db=db, product=product_data, seller_id=current_user.user_id)

@router.get("/{product_id}", response_model=product_schema.ProductResponse)
def read_product(
    product_id: int, 
    db: Session = Depends(get_db)
):
    """ID로 특정 상품 상세 정보 조회"""
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
    return db_product

@router.put("/{product_id}", response_model=product_schema.ProductResponse)
def update_product(
    product_id: int,
    product_update: product_schema.ProductUpdate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user),
):
    """상품 정보 수정"""
    db_product = crud.get_product(db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

    if db_product.seller_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="수정 권한이 없습니다.")

    return crud.update_product(db=db, db_product=db_product, product_update=product_update)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user)
):
    """상품 삭제"""
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

    if db_product.seller_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="상품을 삭제할 권한이 없습니다.")

    for image in db_product.images:
        file_path = "../static/product_images" + image.image_url
        if os.path.exists(file_path):
            os.remove(file_path)
        
    crud.delete_product(db=db, db_product=db_product)
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/{product_id}/like", status_code=status.HTTP_204_NO_CONTENT)
def like_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user)
):
    """상품 찜하기"""
    db_product = crud.get_product(db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
    
    db_like = crud.get_like(db, user_id=current_user.user_id, product_id=product_id)
    if db_like:
        raise HTTPException(status_code=400, detail="이미 찜한 상품입니다.")
        
    crud.create_like(db, user_id=current_user.user_id, product_id=product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/{product_id}/like", status_code=status.HTTP_204_NO_CONTENT)
def unlike_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user)
):
    """상품 찜 취소하기"""
    db_like = crud.get_like(db, user_id=current_user.user_id, product_id=product_id)
    if not db_like:
        raise HTTPException(status_code=404, detail="찜하지 않은 상품입니다.")
        
    crud.delete_like(db, db_like=db_like)
    return Response(status_code=status.HTTP_204_NO_CONTENT)