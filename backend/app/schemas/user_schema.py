from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    """회원 기본 정보"""
    email: EmailStr = Field(..., description="이메일 주소")
    nickname: str = Field(..., max_length=10, description="닉네임 (10자 이하)")

class UserCreate(UserBase):
    """회원 생성"""
    password: str = Field(..., min_length=6, description="비밀번호 (6자 이상)")

class UserUpdate(BaseModel):
    """회원 정보 수정"""
    nickname: Optional[str] = Field(default=None, max_length=10, description="새 닉네임 (10자 이하)")
    password: Optional[str] = Field(default=None, min_length=6, description="새 비밀번호 (6자 이상)")

class UserResponse(BaseModel):
    user_id: int = Field(..., description="회원 고유 ID")
    email: EmailStr = Field(..., description="이메일 주소")
    nickname: str = Field(..., max_length=10, description="닉네임 (10자 이하)")
    is_active: bool = Field(..., description="계정 활성화 여부")
    created_at: datetime = Field(..., description="가입 일시")
    updated_at: datetime = Field(..., description="정보 수정 일시")

    class ConfigDict:
        from_attributes = True

# 토큰 스키마
class Token(BaseModel):
    access_token: str = Field(..., description="JWT 액세스 토큰 문자열")
    token_type: str = Field(..., description="토큰 타입 ('bearer')")

class TokenData(BaseModel):
    email: str | None = Field(default=None, description="토큰에 포함된 사용자 이메일")