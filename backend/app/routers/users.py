# 회원 관련 라우터
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Annotated, List

from database import get_db
from schemas import user_schema, product_schema
from models import user_model

import utils
import auth
import crud

router = APIRouter()

# 회원가입
@router.post("/register", response_model=user_schema.UserResponse)
def register(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    # 이메일 중복 확인
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일 입니다.")

    # 닉네임 중복 확인
    if crud.get_user_by_nickname(db, user.nickname):
        raise HTTPException(status_code=400, detail="이미 존재하는 닉네임입니다.")
    
    return crud.create_user(db, user)

# 로그인
@router.post("/login")
def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # 이메일로 사용자 확인
    user = auth.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="올바른 이메일 또는 비밀번호를 입력해주세요",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})

    refresh_token = auth.create_refresh_token(data={"sub": user.email})

    # Access Token 쿠키 설정
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )
    
    # Refresh Token 쿠키 설정
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=auth.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        path="/users/refresh"
    )

    return {"message": "로그인 성공"}

# Access Token 재발급
@router.post("/refresh", status_code=status.HTTP_200_OK)
def refresh_access_token(
    response: Response,
    current_user: user_model.User = Depends(auth.get_current_user_from_refresh_token)
):
    new_access_token = auth.create_access_token(data={"sub": current_user.email})

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )

    return {"message": "Access Token 갱신 성공"}

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response):
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=1,
        path="/"
    )

    response.set_cookie(
        key="refresh_token",
        value="",
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=1,
        path="/users/refresh"
    )

    return {"message": "로그아웃 성공"}


@router.get("/me", response_model=user_schema.UserResponse)
def read_users_me(current_user: Annotated[user_model.User, Depends(auth.get_current_active_user)]):
    return current_user

@router.patch("/me", response_model=user_schema.UserResponse)
def update_user_me(
    user_update: user_schema.UserUpdate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user)
):
    """현재 로그인된 사용자 정보 수정 (닉네임, 비밀번호)"""
    # 만약 변경하려는 닉네임이 제공되었고, 현재 닉네임과 다르다면 중복 검사
    if user_update.nickname and user_update.nickname != current_user.nickname:
        existing_user = crud.get_user_by_nickname(db, nickname=user_update.nickname)
        if existing_user:
            raise HTTPException(status_code=400, detail="이미 사용 중인 닉네임입니다.")

    return crud.update_user(db=db, db_user=current_user, user_update=user_update)

@router.get("/me/products", response_model=List[product_schema.ProductResponse])
def read_my_products(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user)
):
    """현재 사용자가 등록한 상품 목록 조회"""
    return crud.get_products_by_user(db, user_id=current_user.user_id)

@router.get("/me/likes", response_model=List[product_schema.ProductResponse])
def read_my_liked_products(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth.get_current_active_user)
):
    """현재 사용자가 찜한 상품 목록 조회"""
    return crud.get_liked_products_by_user(db, user_id=current_user.user_id)