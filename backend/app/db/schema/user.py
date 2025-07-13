from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    """ユーザーの基本情報スキーマ"""
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None

class UserCreate(UserBase):
    """ユーザー作成時のスキーマ"""
    password: Optional[str] = None # Google OAuthユーザーはパスワードなし
    google_id: Optional[str] = None # Google OAuthユーザー用

class UserInDB(UserBase):
    """データベースに保存されたユーザー情報のスキーマ"""
    id: int
    hashed_password: Optional[str] = None
    is_active: bool
    google_id: Optional[str] = None

    class Config:
        from_attributes = True # Pydantic v2 for orm_mode (旧: orm_mode = True)

class UserInfo(UserBase):
    """APIレスポンス用のユーザー情報スキーマ"""
    is_active: bool

    class Config:
        from_attributes = True
