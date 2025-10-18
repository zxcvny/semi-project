from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database.database import Base

class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id"), nullable=False)
    title = Column(String(100), nullable=False)
    content = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    location = Column(String(100), nullable=True)
    tag = Column(Enum('선택안함', '무료나눔', '미개봉', '중고', '급매', name='product_tag_enum'), server_default='선택안함', nullable=False)
    status = Column(Enum('판매중', '예약중', '판매완료', name='product_status_enum'), server_default='판매중', nullable=False)
    view_count = Column(Integer, server_default='0', nullable=False)
    wishlist_count = Column(Integer, server_default='0', nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'), onupdate=text('now()'))

    seller = relationship("User")
    category = relationship("Category")
    images = relationship("ProductImage", back_populates="product")


class ProductImage(Base):
    __tablename__ = "product_images"

    image_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    image_url = Column(String(255), nullable=False)
    image_order = Column(Integer, nullable=False, default=0) # 0을 대표 이미지로 사용

    product = relationship("Product", back_populates="images")