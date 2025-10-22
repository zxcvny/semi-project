from sqlalchemy import Column, Integer, String
from database import Base

class Category(Base):
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(30), unique=True, nullable=False, index=True)
    icon_name = Column(String(50), nullable=True)