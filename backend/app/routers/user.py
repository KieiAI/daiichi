from app.db.schema.auth import UserInfo
from app.repositories.auth_repository import AuthRepository
from app.usecases.auth_usecase import AuthUseCase
from fastapi import APIRouter


router = APIRouter()


@router.get("/{user_id}", response_model=UserInfo)
async def get_current_user_info(
    current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    usecase = AuthUseCase(AuthRepository(db))
    return usecase.get_user_info(current_user)
