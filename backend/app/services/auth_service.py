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

# 簡易的なトークンブラックリスト (プロダクションではRedisなどの永続化ストアが必要)
# ログアウトされた refresh token の jti を保持
REVOKED_REFRESH_TOKENS: Set[str] = set()
# ログアウトされた access token の jti を保持 (アクセストークンは短寿命なので、通常はリフレッシュトークンのみで十分だが、即時無効化が必要な場合に備えて)
REVOKED_ACCESS_TOKENS: Set[str] = set()


class AuthService:
    """認証サービス：パスワードハッシュ、JWT生成・検証、トークンブラックリスト管理"""
    SECRET_KEY: str = SECRET_KEY
    ALGORITHM: str = ALGORITHM
    ACCESS_TOKEN_EXPIRE_MINUTES: int = ACCESS_TOKEN_EXPIRE_MINUTES
    REFRESH_TOKEN_EXPIRE_DAYS: int = REFRESH_TOKEN_EXPIRE_DAYS

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """パスワードの検証を行います。"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """パスワードをハッシュ化します。"""
        return pwd_context.hash(password)

    @staticmethod
    def create_token(
        data: dict,
        token_type: str, # "access" または "refresh"
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """指定されたデータとタイプでJWTを作成します。"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(UTC) + expires_delta
        else:
            # デフォルトの有効期限 (使用されないはずだが念のため)
            expire = datetime.now(UTC) + timedelta(minutes=15)

        # JWT ID (JTI) を追加して、トークンの一意性と無効化を可能にする
        jti = str(uuid.uuid4())
        to_encode.update({"exp": expire, "iat": datetime.now(UTC), "jti": jti, "type": token_type})
        encoded_jwt = jwt.encode(to_encode, AuthService.SECRET_KEY, algorithm=AuthService.ALGORITHM)
        return encoded_jwt

    @staticmethod
    def create_access_token(data: dict) -> str:
        """アクセストークンを作成します。"""
        expires_delta = timedelta(minutes=AuthService.ACCESS_TOKEN_EXPIRE_MINUTES)
        return AuthService.create_token(data, "access", expires_delta)

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """リフレッシュトークンを作成します。"""
        expires_delta = timedelta(days=AuthService.REFRESH_TOKEN_EXPIRE_DAYS)
        return AuthService.create_token(data, "refresh", expires_delta)

    @staticmethod
    def verify_token(token: str, token_type: str) -> Optional[dict]:
        """
        トークンを検証し、ペイロードを返します。
        トークンタイプとブラックリストの状態をチェックします。
        """
        try:
            payload = jwt.decode(token, AuthService.SECRET_KEY, algorithms=[AuthService.ALGORITHM])
            
            # トークンタイプとJTIの検証
            if payload.get("type") != token_type:
                return None # 不正なトークンタイプ
            
            jti = payload.get("jti")
            if not jti:
                return None # JTIがないトークンは無効

            # ブラックリストチェック
            if token_type == "access" and jti in REVOKED_ACCESS_TOKENS:
                return None # 無効化されたアクセストークン
            if token_type == "refresh" and jti in REVOKED_REFRESH_TOKENS:
                return None # 無効化されたリフレッシュトークン

            return payload
        except JWTError:
            return None

    @staticmethod
    def revoke_token(jti: str, token_type: str):
        """指定されたJTIとタイプを持つトークンをブラックリストに追加して無効化します。"""
        if token_type == "access":
            REVOKED_ACCESS_TOKENS.add(jti)
        elif token_type == "refresh":
            REVOKED_REFRESH_TOKENS.add(jti)