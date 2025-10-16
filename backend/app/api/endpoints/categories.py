from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from models import category as category_model
from schemas import category as category_schema

router = APIRouter()

@router.get("/categories", response_model=List[category_schema.Category])
def read_categories(db: Session = Depends(get_db)):
    """
    모든 카테고리 목록 조회
    """
    categories = db.query(category_model.Category).all()
    return categories