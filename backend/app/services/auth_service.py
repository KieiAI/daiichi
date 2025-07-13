from datetime import datetime, timedelta, UTC
from typing import Optional, Set
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
import os
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 環境変数から読み込む。本番環境では必ず設定すること
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-and-very-long-key-replace-me-with-env-variable")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """パスワードの検証"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """パスワードのハッシュ化"""
        return pwd_context.hash(password)

    @staticmethod
    def create_token(
        data: dict,
        token_type: str,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """各種トークン作成のユーティリティ関数"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(UTC) + expires_delta
        else:
            expire = datetime.now(UTC) + timedelta(minutes=15)

        to_encode.update({"exp": expire, "iat": datetime.now(UTC), "type": token_type})
        encoded_jwt = jwt.encode(to_encode, AuthService.SECRET_KEY, algorithm=AuthService.ALGORITHM)
        return encoded_jwt

    @staticmethod
    def create_access_token(data: dict) -> str:
        """アクセストークンの作成"""
        expires_delta = timedelta(minutes=AuthService.ACCESS_TOKEN_EXPIRE_MINUTES)
        return AuthService.create_token(data, "access", expires_delta)

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """リフレッシュトークンの作成"""
        expires_delta = timedelta(days=AuthService.REFRESH_TOKEN_EXPIRE_DAYS)
        return AuthService.create_token(data, "refresh", expires_delta)

    @staticmethod
    def verify_token(token: str, token_type: str) -> Optional[dict]:
        """
        トークンの検証

        """
        try:
            payload = jwt.decode(token, AuthService.SECRET_KEY, algorithms=[AuthService.ALGORITHM])
            
            if payload.get("type") != token_type:
                return None

            return payload
        except JWTError:
            return None
