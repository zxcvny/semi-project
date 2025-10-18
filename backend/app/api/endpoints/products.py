from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from schemas import product as product_schema
from models import product as product_model
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
def read_products(sort: str = "latest", db: Session = Depends(get_db)):
    """
    모든 상품 목록 조회
    """
    if sort == "latest":
        products = db.query(product_model.Product).order_by(product_model.Product.created_at.desc()).all()
    else:
        products = db.query(product_model.Product).all()
        
    return products