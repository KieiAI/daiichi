# app/repositories/user_repository.py
from sqlalchemy.orm import Session
from app.db.models import User
from app.db.schema.user import UserCreate
from typing import Optional

class UserRepository:
    """ユーザー関連のデータベース操作を管理するリポジトリクラス"""
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """IDでユーザーを取得します。"""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_username(self, username: str) -> Optional[User]:
        """ユーザー名でユーザーを取得します。"""
        return self.db.query(User).filter(User.username == username).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """メールアドレスでユーザーを取得します。"""
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_google_id(self, google_id: str) -> Optional[User]:
        """Google IDでユーザーを取得します。"""
        return self.db.query(User).filter(User.google_id == google_id).first()

    def create_user(self, user: UserCreate, hashed_password: Optional[str] = None) -> User:
        """新しいユーザーを作成します。"""
        db_user = User(
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            hashed_password=hashed_password,
            google_id=user.google_id,
            is_active=True # 新規作成時はアクティブ
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update_user(self, user: User, **kwargs) -> User:
        """既存のユーザー情報を更新します。"""
        for key, value in kwargs.items():
            setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user