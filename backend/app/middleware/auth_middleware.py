# app/middleware/auth.py
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse
from app.services.auth_service import AuthService # REVOKED_ACCESS_TOKENS, REVOKED_REFRESH_TOKENSは削除された
from app.repositories.user_repository import UserRepository
from app.db.database import SessionLocal
from app.db.schema.user import UserInfo

class AuthMiddleware(BaseHTTPMiddleware):
    """
    Cookieからアクセストークンを検証し、
    認証済みユーザー情報をリクエストのstateにセット
    """
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        public_paths = [
            "/api/v1/auth/login",
            "/api/v1/auth/google",
            "/api/v1/auth/google/callback",
            "/api/v1/auth/refresh",
            "/",
            "/docs", "/redoc", "/openapi.json"
        ]

        if any(request.url.path.startswith(p) for p in public_paths):
            response = await call_next(request)
            return response

        access_token = request.cookies.get("access_token")
        if not access_token:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Not authenticated. Access token missing."}
            )

        payload = AuthService.verify_token(access_token, "access")
        if not payload:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid or expired access token."}
            )
        
        user_id_str = payload.get("sub")
        if not user_id_str:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid token payload: user ID missing."}
            )

        try:
            user_id = int(user_id_str)
        except ValueError:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid user ID format in token."}
            )

        db = SessionLocal()
        try:
            user_repo = UserRepository(db)
            user = user_repo.get_user_by_id(user_id)

            if not user or not user.is_active:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "User inactive or not found."}
                )
            
            request.state.user = UserInfo.model_validate(user)

        finally:
            db.close()

        response = await call_next(request)
        return response