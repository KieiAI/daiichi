# app/repositories/user_repository.py
from sqlalchemy.orm import Session
from app.db.models import User
from app.db.schema.user import UserCreate
from typing import Optional

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """IDでユーザーを取得します。"""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_name(self, name: str) -> Optional[User]:
        """ユーザー名でユーザーを取得"""
        return self.db.query(User).filter(User.name == name).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """メールアドレスのユーザーを取得"""
        return self.db.query(User).filter(User.email == email).first()
    # def get_user_by_google_id(self, google_id: str) -> Optional[User]:
    #     """Google IDでユーザーを取得します。"""
    #     return self.db.query(User).filter(User.google_id == google_id).first()

    def create_user(self, user: UserCreate, hashed_password: Optional[str] = None) -> User:
        """新しいユーザーの作成"""
        db_user = User(
            name=user.name,
            email=user.email,
            hashed_password=hashed_password,
            role=user.role
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