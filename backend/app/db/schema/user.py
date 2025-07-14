from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    """ユーザーの基本情報スキーマ"""
    name: str
    email: Optional[EmailStr] = None

class UserCreate(UserBase):
    """ユーザー作成時のスキーマ"""
    password: Optional[str] = None # Google OAuthユーザーはパスワードなし
    role: str
    # google_id: Optional[str] = None # Google OAuthユーザー用

class UserInfo(UserBase):
    """APIレスポンス用のユーザー情報スキーマ"""
    is_active: bool
    email: Optional[EmailStr] = None

    class Config:
        from_attributes = True
