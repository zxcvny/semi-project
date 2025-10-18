from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import enum

# Enum 클래스를 사용하여 tag와 status의 값 제한
class ProductTagEnum(str, enum.Enum):
    선택안함 = '선택안함'
    무료나눔 = '무료나눔'
    미개봉 = '미개봉'
    중고 = '중고'
    급매 = '급매'

class ProductStatusEnum(str, enum.Enum):
    판매중 = '판매중'
    예약중 = '예약중'
    판매완료 = '판매완료'


# --- 상품 이미지 스키마 ---
class ProductImageBase(BaseModel):
    image_url: str
    image_order: int = 0

class ProductImageCreate(ProductImageBase):
    pass

class ProductImage(ProductImageBase):
    image_id: int
    product_id: int

    class Config:
        orm_mode = True


# --- 상품 스키마 ---
class ProductBase(BaseModel):
    title: str = Field(..., max_length=100)
    content: str
    price: int = Field(..., ge=0) # 가격은 0 이상
    location: Optional[str] = None
    tag: ProductTagEnum = ProductTagEnum.선택안함
    category_id: int


class ProductCreate(ProductBase):
    # 상품 생성 시에는 이미지 URL 리스트를 함께 받음
    images: List[ProductImageCreate] = []


class Product(ProductBase):
    product_id: int
    seller_id: int
    status: ProductStatusEnum
    view_count: int
    wishlist_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # 관계 필드: 응답 시 포함될 이미지 목록
    images: List[ProductImage] = []

    class Config:
        orm_mode = True