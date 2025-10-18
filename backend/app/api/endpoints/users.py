from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from schemas import user as user_schema
from models import user as user_model
from database.database import get_db

router = APIRouter()

@router.post("/users", response_model=user_schema.UserResponse)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user_email = db.query(user_model.User).filter(user_model.User.email == user.email).first()
    if db_user_email:
        raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다.")

    db_user_nickname = db.query(user_model.User).filter(user_model.User.nickname == user.nickname).first()
    if db_user_nickname:
        raise HTTPException(status_code=400, detail="이미 사용 중인 닉네임입니다.")
    db_user = user_model.User(email=user.email, password=user.password, nickname=user.nickname)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=user_schema.UserResponse)
def login_user(user: user_schema.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(user_model.User).filter(user_model.User.email == user.email).first()
    if not db_user or db_user.password != user.password:
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")
    return db_user