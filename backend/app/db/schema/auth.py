from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    """ログインリクエストのスキーマ"""
    name: str
    password: str

class TokenData(BaseModel):
    """JWTペイロードのスキーマ"""
    sub: Optional[str] = None
    jti: Optional[str] = None
    type: str

class LoginResponse(BaseModel):
    """ログインレスポンスのスキーマ"""
    message: str = "Login successful"
