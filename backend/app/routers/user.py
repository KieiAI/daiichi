from app.db.schema.auth import UserInfo
from app.usecases.auth_usecase import AuthUseCase
from app.repositories.user_repository import UserRepository
from fastapi import APIRouter


router = APIRouter()

@router.get("/{user_id}", response_model=UserInfo)
async def get_current_user_info(
    current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    usecase = AuthUseCase(UserRepository(db))
    return usecase.get_user_info(current_user)

@router.post("/create", response_model=UserInfo)
async def create_user(
    user_create: UserCreate, db: Session = Depends(get_db)
):
    usecase = AuthUseCase(UserRepository(db))
    return usecase.create_user(user_create)
