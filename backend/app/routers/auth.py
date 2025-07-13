from app.db.db import get_db
from fastapi import APIRouter, Depends, Response, Request, HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.usecases.auth_usecase import AuthUseCase, GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI
from app.db.schema.auth import LoginRequest, LoginResponse
from app.db.schema.user import UserInfo
from app.services.auth_service import AuthService
from urllib.parse import urlencode
import uuid

router = APIRouter()

async def get_current_user(request: Request) -> UserInfo:
    user_info = request.state.user
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: User info not found in request state."
        )
    return user_info

@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    ログイン後、アクセストークンとリフレッシュトークンをCookieに設定
    """
    usecase = AuthUseCase(UserRepository(db))
    return usecase.login(login_data.name, login_data.password, response)

# @router.get("/auth/google")
# async def google_auth_start(request: Request):
#     """
#     Google OAuth認証フローを開始します。
#     ユーザーをGoogle認証ページにリダイレクトするためのURLを返します。
#     """
#     # CSRF対策のためのstateパラメータを生成し、セッションに保存
#     state = str(uuid.uuid4())
#     request.session["oauth_state"] = state

#     params = {
#         "response_type": "code",
#         "client_id": GOOGLE_CLIENT_ID,
#         "redirect_uri": GOOGLE_REDIRECT_URI,
#         "scope": "openid email profile", # 必要なスコープを指定
#         "state": state,
#         "access_type": "offline" # リフレッシュトークンが必要な場合
#     }
#     google_auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
#     return {"url": google_auth_url} # フロントエンドにリダイレクトURLを返す

# @router.get("/auth/google/callback", response_model=LoginResponse)
# async def google_auth_callback(
#     code: str,
#     state: str,
#     request: Request,
#     response: Response,
#     db: Session = Depends(get_db)
# ):
#     """
#     Google OAuth認証のコールバックエンドポイント。
#     Googleからの認証コードを受け取り、トークンを交換してユーザーを認証します。
#     認証成功後、アクセストークンとリフレッシュトークンをHttpOnly Secure Cookieに設定します。
#     """
#     usecase = AuthUseCase(UserRepository(db))
#     return await usecase.google_login(code, state, request, response)

@router.post("/refresh", response_model=LoginResponse)
async def refresh_tokens(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Cookieからリフレッシュトークンを読み取り、検証後に新しいトークンをCookieに設定
    """
    usecase = AuthUseCase(UserRepository(db))
    return usecase.refresh_tokens(request, response)

@router.post("/logout", response_model=LoginResponse)
async def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: UserInfo = Depends(get_current_user) # ログアウトは認証済みユーザーのみ可能とする
):
    """
    Cookieから認証トークンを削除
    """
    usecase = AuthUseCase(UserRepository(db))
    return usecase.logout(request, response)