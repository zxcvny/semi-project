from pydantic import BaseModel, Field

class CategoryBase(BaseModel):
    name: str = Field(..., max_length=50, description="카테고리 이름")
    icon_name: str | None = Field(default=None, description="리액트 아이콘 이름")

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(BaseModel):
    category_id: int = Field(..., description="카테고리 고유 ID")
    name: str = Field(..., description="카테고리 이름")
    icon_name: str | None = Field(default=None, description="리액트 아이콘 이름")

    class ConfigDict:
        from_attributes = True