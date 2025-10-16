from pydantic import BaseModel
from typing import Optional

class Category(BaseModel):
    category_id: int
    name: str
    icon_name: Optional[str] = None

    class Config:
        orm_mode = True