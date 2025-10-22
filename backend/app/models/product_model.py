from sqlalchemy import (
    Column, Integer, String, Boolean, Text, DateTime,
    ForeignKey, func, Enum as SQLEnum, UniqueConstraint
)

from sqlalchemy.orm import relationship
from database import Base
import enum

class ProductTagEnum(enum.Enum):
    NONE = "선택안함"
    FREE = "무료나눔"
    NEW = "미개봉"
    USED = "중고"
    URGENT = "급매"

class ProductStatusEnum(enum.Enum):
    FOR_SALE = "판매중"
    RESERVED = "예약중"
    SOLD_OUT = "판매완료"

class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True)

    seller_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id"), nullable=False)

    title = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    price = Column(Integer, nullable=False)
    trade_city = Column(String(10), nullable=True)
    trade_district = Column(String(10), nullable=True)

    product_tag = Column(SQLEnum(ProductTagEnum), default=ProductTagEnum.NONE, nullable=False)
    product_status = Column(SQLEnum(ProductStatusEnum), default=ProductStatusEnum.FOR_SALE, nullable=False)

    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    seller = relationship("User")
    category = relationship("Category")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"

    image_id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String(1024), nullable=False)
    is_representative = Column(Boolean, default=False, nullable=False)

    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)

    product = relationship("Product", back_populates="images")

class ProductLike(Base):
    __tablename__ = "product_likes"

    like_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)

    user = relationship("User")
    product = relationship("Product")

    # 한 사용자가 같은 상품을 여러 번 찜하지 못하도록 제약 조건 추가
    __table_args__ = (UniqueConstraint('user_id', 'product_id', name='_user_product_uc'),)