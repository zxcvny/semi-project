from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from enum import Enum
from typing import List, Optional

from .user_schema import UserResponse
from .category_schema import CategoryResponse

class ProductTag(str, Enum):
    NONE = "선택안함"
    FREE = "무료나눔"
    NEW = "미개봉"
    USED = "중고"
    URGENT = "급매"

class ProductStatus(str, Enum):
    FOR_SALE = "판매중"
    RESERVED = "예약중"
    SOLD_OUT = "판매완료"

# ----- 상품 이미지 -----
class ProductImageBase(BaseModel):
    image_url: str = Field(..., description="상품 이미지 URL")
    is_representative: bool = Field(default=False, description="대표 이미지 여부 (1장 필수)")

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageResponse(ProductImageBase):
    image_id: int
    product_id: int

    class ConfigDict:
        from_attributes = True

# ----- 상품 -----
class ProductBase(BaseModel):
    title: str = Field(..., max_length=50, description="상품 제목")
    content: str = Field(..., max_length=2000, description="상품 내용")
    price: int = Field(..., ge=0, description="가격 (0원 이상)")
    trade_city: Optional[str] = Field(default=None, max_length=10, description="거래 희망 지역 (시)")
    trade_district: Optional[str] = Field(default=None, max_length=10, description="거래 희망 지역 (구)")
    
    product_tag: ProductTag = Field(default=ProductTag.NONE, description="상품 태그")
    category_id: int = Field(..., description="카테고리 ID")

class ProductCreate(ProductBase):
    images: List[ProductImageCreate] = Field(..., min_length=1, max_length=10, description="상품 이미지 목록 (최소 1장, 최대 10장)")

    @field_validator('images')
    def validate_representative_image(cls, v):
        """대표 이미지가 1장인지 검증"""
        rep_count = sum(1 for img in v if img.is_representative)
        if rep_count == 0:
            raise ValueError("대표 이미지가 1장 필요합니다.")
        if rep_count > 1:
            raise ValueError("대표 이미지는 1장만 설정할 수 있습니다.")
        return v
        
class ProductUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=50)
    content: Optional[str] = Field(default=None, max_length=2000)
    price: Optional[int] = Field(default=None, ge=0)
    trade_city: Optional[str] = Field(default=None, max_length=10)
    trade_district: Optional[str] = Field(default=None, max_length=10)
    product_tag: Optional[ProductTag] = Field(default=None)
    product_status: Optional[ProductStatus] = Field(default=None, description="상품 상태")
    category_id: Optional[int] = Field(default=None)
    images: Optional[List[ProductImageCreate]] = Field(default=None, min_length=1, max_length=10)

    @field_validator('images')
    def validate_update_images(cls, v):
        """수정 시 이미지 목록이 제공된 경우, 대표 이미지 1장 검증"""
        if v is None: # 이미지를 수정하지 않는 경우
            return v
        
        rep_count = sum(1 for img in v if img.is_representative)
        if rep_count == 0:
            raise ValueError("대표 이미지가 1장 필요합니다.")
        if rep_count > 1:
            raise ValueError("대표 이미지는 1장만 설정할 수 있습니다.")
        return v
    
class ProductResponse(ProductBase):
    product_id: int
    product_status: ProductStatus
    views: int
    likes: int
    created_at: datetime
    updated_at: datetime

    seller: UserResponse
    category: CategoryResponse
    images: List[ProductImageResponse]

    class ConfigDict:
        from_attributes = True