from app.db.schema.user import UserInfo
from app.usecases.auth_usecase import AuthUseCase
from app.repositories.user_repository import UserRepository
from app.db.schema.user import UserCreate
from app.routers.auth import get_current_user
from app.db.db import get_db
from app.usecases.user_usecase import UserUseCase
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/{user_id}", response_model=UserInfo)
async def get_current_user_info(
    current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    usecase = AuthUseCase(UserRepository(db))
    return usecase.get_user_info(current_user)

@router.post("/create")
async def create_user(
    user_create: UserCreate, db: Session = Depends(get_db)
):
    usecase = UserRepository(db)
    return usecase.create_user(user_create)
