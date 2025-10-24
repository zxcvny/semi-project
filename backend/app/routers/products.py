from fastapi import (
    APIRouter, Depends, HTTPException, status, Response, 
    UploadFile, File, Form, Request
)
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import uuid4
import os
import shutil
from database import get_db
from schemas import product_schema
from models import user_model
import crud
import auth

router = APIRouter()

viewed_products = {}

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

@router.get("/search", response_model=List[product_schema.ProductResponse])
def search_products(
    q: str = "",
    skip: int = 0,
    limit: int = 16,
    db: Session = Depends(get_db)
):
    """상품 제목으로 검색"""
    if not q.strip():
        return[]
    products = crud.search_products_by_title(db, query=q, skip=skip, limit=limit)
    return products

@router.get("/{product_id}", response_model=product_schema.ProductResponse)
def read_product(product_id: int, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host
    now = datetime.now()

    # 최근 1분 내에 조회한 기록이 있으면 조회수 증가하지 않음
    last_view = viewed_products.get(client_ip, {}).get(product_id)
    if not last_view or now - last_view > timedelta(minutes=0.001):
        db_product = crud.get_product(db, product_id=product_id)
        db_product.views += 1
        db.commit()
        db.refresh(db_product)

        viewed_products.setdefault(client_ip, {})[product_id] = now
    else:
        db_product = crud.get_product(db, product_id=product_id)

    return db_product

@router.put("/{product_id}", response_model=product_schema.ProductResponse)
def update_product(
    product_id: int,
    # --- Form 데이터로 받도록 변경 ---
    title: str = Form(...),
    content: str = Form(...),
    price: int = Form(...),
    category_id: int = Form(...),
    trade_city: Optional[str] = Form(None),
    trade_district: Optional[str] = Form(None),
    product_tag: product_schema.ProductTag = Form(...),
    product_status: product_schema.ProductStatus = Form(...),
    keep_image_ids: List[int] = Form([]), # 유지할 기존 이미지 ID 목록
    new_images: List[UploadFile] = File([]), # 새로 업로드된 이미지 파일 목록
    representative_image_index: int = Form(0), # 전체 이미지 목록 기준 대표 이미지 인덱스
    # ---------------------------------
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user),
):
    """상품 정보 수정 (이미지 포함)"""
    db_product = crud.get_product(db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

    if db_product.seller_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="수정 권한이 없습니다.")

    # --- 이미지 처리 로직 추가 ---
    current_images = db_product.images[:] # 기존 이미지 목록 복사
    images_to_delete = []
    final_image_schemas = [] # 최종적으로 DB에 저장될 이미지 스키마 목록

    # 1. 유지할 이미지 처리
    for img_id_to_keep in keep_image_ids:
        found = False
        for img in current_images:
            if img.image_id == img_id_to_keep:
                # 유지할 이미지 정보를 final_image_schemas에 추가
                final_image_schemas.append(product_schema.ProductImageCreate(
                    image_url=img.image_url, # 기존 URL 사용
                    is_representative=False # 대표 여부는 나중에 설정
                ))
                found = True
                break
        if not found:
             print(f"Warning: Keep image ID {img_id_to_keep} not found for product {product_id}")
             # 필요시 여기서 오류 처리

    # 2. 삭제할 이미지 결정 (current_images 중 keep_image_ids에 없는 것)
    for img in current_images:
        if img.image_id not in keep_image_ids:
            images_to_delete.append(img) # 삭제 대상 모델 객체 추가

    # 3. 새로 추가된 이미지 처리
    new_image_urls = []
    if new_images:
         total_images = len(keep_image_ids) + len(new_images)
         if total_images > 10:
              raise HTTPException(status_code=400, detail="이미지는 최대 10개까지 등록할 수 있습니다.")
         if total_images == 0:
              raise HTTPException(status_code=400, detail="이미지는 최소 1개 이상 등록해야 합니다.")

         for image_file in new_images:
             saved_url = save_image(image_file)
             new_image_urls.append(saved_url)
             final_image_schemas.append(product_schema.ProductImageCreate(
                 image_url=saved_url,
                 is_representative=False # 대표 여부는 나중에 설정
             ))

    # 4. 대표 이미지 설정
    if not (0 <= representative_image_index < len(final_image_schemas)):
         # 기본값으로 첫 번째 이미지를 대표로 설정하거나 오류 발생
         if final_image_schemas:
              final_image_schemas[0].is_representative = True
              print(f"Warning: Invalid representative index {representative_image_index}, defaulting to 0.")
         else:
              raise HTTPException(status_code=400, detail="대표 이미지를 설정할 수 없습니다 (이미지 없음).")
    else:
        final_image_schemas[representative_image_index].is_representative = True


    # --- ProductUpdate 스키마 생성 ---
    product_update_data = product_schema.ProductUpdate(
        title=title,
        content=content,
        price=price,
        category_id=category_id,
        trade_city=trade_city,
        trade_district=trade_district,
        product_tag=product_tag,
        product_status=product_status,
        images=final_image_schemas # 최종 이미지 목록 전달
    )
    # -----------------------------

    # CRUD 함수 호출 시 삭제할 이미지 객체 목록도 전달
    return crud.update_product(
        db=db,
        db_product=db_product,
        product_update=product_update_data,
        images_to_delete=images_to_delete # 삭제할 이미지 객체 목록 전달
    )

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

