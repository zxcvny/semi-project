import os
from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    import crud
    from schemas import category_schema
    from models import user_model, category_model, product_model

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # 카테고리 목록
    CATEGORIES = [
        {"name": "디지털기기", "icon_name": "FiSmartphone"},
        {"name": "컴퓨터", "icon_name": "FaComputer"},
        {"name": "카메라", "icon_name": "FaCameraRetro"},
        {"name": "가구/인테리어", "icon_name": "RiSofaLine"},
        {"name": "자전거", "icon_name": "LiaBicycleSolid"},
        {"name": "패션/잡화", "icon_name": "RiShoppingBag4Line"},
        {"name": "오디오", "icon_name": "FiHeadphones"},
        {"name": "시계/쥬얼리", "icon_name": "FiWatch"},
    ]

    try:
        # print("초기 카테고리 데이터를 확인하고 추가..")
        for cat_data in CATEGORIES:
            category = crud.get_category_by_name(db, name=cat_data["name"])
            if not category:
                new_category = category_schema.CategoryCreate(
                    name=cat_data["name"],
                    icon_name=cat_data["icon_name"]
                )
                crud.create_category(db, category=new_category)
                # print(f" - '{cat_data['name']}' 카테고리 추가 완료")
    finally:
        db.close()