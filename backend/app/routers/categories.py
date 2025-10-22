from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List

from schemas import category_schema, product_schema
from database import get_db
import crud

router = APIRouter()

@router.get("/", response_model=List[category_schema.CategoryResponse])
def read_all_categories(db: Session = Depends(get_db)):
    """모든 카테고리 목록 조회"""
    categories = crud.get_all_categories(db)
    return categories

@router.get("/{category_id}", response_model=category_schema.CategoryResponse)
def read_categories(category_id: int, db: Session = Depends(get_db)):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="카테고리를 찾을 수 없습니다.")
    return db_category

@router.get("/{category_name:path}/products", response_model=List[product_schema.ProductResponse])
def read_products_by_category_name(
    category_name: str = Path(..., title="카테고리 이름"),
    skip: int = 0,
    limit: int = 16,
    db: Session = Depends(get_db)
):
    """특정 카테고리 이름에 속한 상품 목록 조회"""
    # 카테고리 이름으로 존재 여부 확인
    category = crud.get_category_by_name(db, name=category_name)
    if category is None:
        raise HTTPException(status_code=404, detail="카테고리를 찾을 수 없습니다.")

    products = crud.get_products_by_category_name(
        db, category_name=category_name, skip=skip, limit=limit
    )
    return products