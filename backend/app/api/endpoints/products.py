from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from urllib.parse import unquote # unquote 함수를 import 합니다.

from schemas import product as product_schema
from models import product as product_model, category as category_model
from database.database import get_db

router = APIRouter()

@router.post("/products", response_model=product_schema.Product)
def create_product(product: product_schema.ProductCreate, db: Session = Depends(get_db)):
    """
    새로운 상품 생성
    """
    db_product = product_model.Product(
        seller_id=product.seller_id,
        category_id=product.category_id,
        title=product.title,
        content=product.content,
        price=product.price,
        location=product.location,
        tag=product.tag
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    for image in product.images:
        db_image = product_model.ProductImage(
            product_id=db_product.product_id,
            image_url=image.image_url,
            image_order=image.image_order
        )
        db.add(db_image)
    
    db.commit()
    db.refresh(db_product)

    return db_product

@router.get("/products", response_model=List[product_schema.Product])
def read_products(sort: str = "latest", category: Optional[str] = None, db: Session = Depends(get_db)):
    """
    모든 상품 목록 조회 (카테고리별 필터링 가능)
    """
    query = db.query(product_model.Product)

    if category:
        # URL 디코딩을 수행합니다.
        decoded_category = unquote(category)
        query = query.join(category_model.Category).filter(category_model.Category.name == decoded_category)

    if sort == "latest":
        products = query.order_by(product_model.Product.created_at.desc()).all()
    else:
        products = query.all()
        
    return products