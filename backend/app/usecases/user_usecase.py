from http.client import HTTPException, status
from app.db.schema.user import UserInfo
from app.repositories.user_repository import UserRepository


class UserUseCase:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def get_user_info(self, username: str) -> UserInfo:
        user = self.user_repo.get_user_by_username(username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        return UserInfo(
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
        )
