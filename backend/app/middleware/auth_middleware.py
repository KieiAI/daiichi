from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse
from app.services.auth_service import AuthService
from app.repositories.user_repository import UserRepository
from app.db.database import SessionLocal
from app.db.schema.user import UserInfo

class AuthMiddleware(BaseHTTPMiddleware):
    """
    リクエスト認証を行うミドルウェア。
    保護されたパスへのアクセス時にCookieからアクセストークンを検証し、
    認証済みユーザー情報をリクエストのstateにアタッチします。
    """
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # 認証が不要なパスをスキップ
        # ここはプロジェクトの要件に合わせて調整してください。
        # 例: ログイン、Google OAuthコールバック、リフレッシュ、公開されている情報など
        public_paths = [
            "/api/v1/auth/login",
            "/api/v1/auth/google",
            "/api/v1/auth/google/callback",
            "/api/v1/auth/refresh",
            "/", # ルートパス
            "/docs", "/redoc", "/openapi.json" # FastAPIのドキュメントパス
        ]

        # リクエストパスがpublic_pathsのいずれかで始まるかチェック
        # /api/v1/auth/ のようにプレフィックスが一致すればOK
        if any(request.url.path.startswith(p) for p in public_paths):
            response = await call_next(request)
            return response
        
        # --- 保護されたパスの場合、認証処理を実行 ---

        # Cookieからアクセストークンを取得
        access_token = request.cookies.get("access_token")

        if not access_token:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Not authenticated. Access token missing."}
            )

        # トークンの検証
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

        # DBセッションの取得とユーザー情報の取得
        db = SessionLocal()
        try:
            user_repo = UserRepository(db)
            user = user_repo.get_user_by_id(user_id)

            if not user or not user.is_active:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "User inactive or not found."}
                )
            
            # 認証されたユーザー情報をリクエストの`state`にアタッチ
            # これにより、後続のエンドポイントで`request.state.user`としてアクセス可能になる
            request.state.user = UserInfo.model_validate(user)

        finally:
            db.close()

        # 次のミドルウェアまたはエンドポイントへ処理を渡す
        response = await call_next(request)
        return response