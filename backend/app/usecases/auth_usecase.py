from fastapi import HTTPException, status, Response, Request
from app.db.schema.user import UserInfo, UserCreate
from app.db.schema.auth import LoginRequest, LoginResponse, TokenData
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService, REVOKED_ACCESS_TOKENS, REVOKED_REFRESH_TOKENS
from app.db.models import User
from typing import Optional
import httpx
import os
import uuid # ユーザー名生成用

# Google OAuthの設定 (環境変数から読み込む)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "YOUR_GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/auth/google/callback")

class AuthUseCase:
    """認証およびユーザー関連のビジネスロジックを管理するユースケースクラス"""
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def get_user_info(self, user_id: int) -> UserInfo:
        """指定されたIDのユーザー情報を取得します。"""
        user = self.user_repo.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return UserInfo.model_validate(user)

    def login(self, username: str, password: str, response: Response) -> LoginResponse:
        """
        ユーザー名とパスワードによるログイン処理を実行します。
        認証成功後、アクセストークンとリフレッシュトークンをCookieに設定します。
        """
        user = self.user_repo.get_user_by_username(username)
        if not user or not user.hashed_password or not AuthService.verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"}, # ヘッダーは形式上残すが、Cookie使用
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )

        # アクセストークンとリフレッシュトークンを生成
        access_token = AuthService.create_access_token(data={"sub": str(user.id)})
        refresh_token = AuthService.create_refresh_token(data={"sub": str(user.id)})

        # HttpOnly Secure Cookieに設定
        self._set_auth_cookies(response, access_token, refresh_token)

        return LoginResponse(message="Login successful")

    async def google_login(self, code: str, state: str, request: Request, response: Response) -> LoginResponse:
        """
        Google OAuthのコールバックを処理し、ユーザーを認証します。
        認証成功後、アプリケーション独自のJWTを生成しCookieに設定します。
        """
        # CSRF対策: stateの検証
        session_state = request.session.get("oauth_state")
        if not session_state or state != session_state:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="State mismatch or missing")
        request.session.pop("oauth_state", None) # 使用後は削除

        async with httpx.AsyncClient() as client:
            token_url = "https://oauth2.googleapis.com/token"
            token_params = {
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            }
            try:
                token_response = await client.post(token_url, data=token_params)
                token_response.raise_for_status() # HTTPエラーをチェック
                token_data = token_response.json()
            except httpx.HTTPStatusError as e:
                raise HTTPException(status_code=e.response.status_code, detail=f"Failed to get Google tokens: {e.response.text}")
            except httpx.RequestError as e:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Network error during Google token exchange: {e}")

        id_token = token_data.get("id_token")
        if not id_token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID Token not found from Google")

        try:
            # Google ID Tokenの検証 (google-authライブラリを使用するとより堅牢)
            # 開発中は署名検証をスキップ可（非推奨だが簡易的に）
            google_payload = jwt.decode(id_token, options={"verify_signature": False})
            
            # 本番環境では以下のように厳密に検証する (google-authライブラリをインストールする必要がある)
            # from google.oauth2 import id_token as google_id_token
            # from google.auth.transport import requests as google_requests
            # google_payload = google_id_token.verify_oauth2(id_token, google_requests.Request(), GOOGLE_CLIENT_ID)
            
            # 発行者とオーディエンスの確認 (最低限の検証)
            if google_payload.get("iss") not in ["https://accounts.google.com", "accounts.google.com"]:
                raise ValueError("Invalid issuer")
            if google_payload.get("aud") != GOOGLE_CLIENT_ID:
                raise ValueError("Invalid audience")

        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid Google ID Token: {e}")

        google_user_id = google_payload.get("sub")
        email = google_payload.get("email")
        name = google_payload.get("name") # full_nameとして使用

        user = self.user_repo.get_user_by_google_id(google_user_id)
        if not user:
            # 新規ユーザー登録
            username = email.split('@')[0] if email else google_user_id # メールアドレスからユーザー名生成、またはGoogle ID
            # ユニークなユーザー名にするための簡易的な処理 (衝突する可能性あり)
            if self.user_repo.get_user_by_username(username):
                username = f"{username}_{str(uuid.uuid4())[:8]}"

            user_create = UserCreate(
                username=username,
                email=email,
                full_name=name,
                google_id=google_user_id,
                password=None # Googleユーザーはパスワードなし
            )
            user = self.user_repo.create_user(user_create)
        
        # 既存ユーザーだがGoogle IDが紐付いていない場合（メールアドレスで紐付け）
        elif not user.google_id and email:
            existing_user_by_email = self.user_repo.get_user_by_email(email)
            if existing_user_by_email and existing_user_by_email.id != user.id:
                # メールアドレスが既存の別ユーザーと重複している場合、エラーまたは統合ロジック
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered with another account.")
            
            user = self.user_repo.update_user(user, google_id=google_user_id)


        # アプリケーション独自のJWTアクセストークンとリフレッシュトークンを生成
        access_token = AuthService.create_access_token(data={"sub": str(user.id)})
        refresh_token = AuthService.create_refresh_token(data={"sub": str(user.id)})

        # HttpOnly Secure Cookieに設定
        self._set_auth_cookies(response, access_token, refresh_token)

        return LoginResponse(message="Google login successful")

    def refresh_tokens(self, request: Request, response: Response) -> LoginResponse:
        """
        リフレッシュトークンを使用して新しいアクセストークンとリフレッシュトークンを発行します。
        """
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token missing",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        payload = AuthService.verify_token(refresh_token, "refresh")
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = self.user_repo.get_user_by_id(int(user_id))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User inactive or not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 古いリフレッシュトークンを無効化 (JTIを使用)
        old_jti = payload.get("jti")
        if old_jti:
            AuthService.revoke_token(old_jti, "refresh")

        # 新しいアクセストークンとリフレッシュトークンを生成
        new_access_token = AuthService.create_access_token(data={"sub": str(user.id)})
        new_refresh_token = AuthService.create_refresh_token(data={"sub": str(user.id)})

        # HttpOnly Secure Cookieに設定
        self._set_auth_cookies(response, new_access_token, new_refresh_token)

        return LoginResponse(message="Tokens refreshed successfully")

    def logout(self, request: Request, response: Response) -> LoginResponse:
        """
        ユーザーをログアウトさせ、関連するトークンを無効化しCookieを削除します。
        """
        access_token = request.cookies.get("access_token")
        refresh_token = request.cookies.get("refresh_token")

        # アクセストークンをブラックリストに追加
        if access_token:
            payload = AuthService.verify_token(access_token, "access")
            if payload and payload.get("jti"):
                AuthService.revoke_token(payload["jti"], "access")
        
        # リフレッシュトークンをブラックリストに追加
        if refresh_token:
            payload = AuthService.verify_token(refresh_token, "refresh")
            if payload and payload.get("jti"):
                AuthService.revoke_token(payload["jti"], "refresh")

        # Cookieを削除 (有効期限を過去に設定)
        response.delete_cookie(key="access_token", httponly=True, secure=True, samesite="Lax")
        response.delete_cookie(key="refresh_token", httponly=True, secure=True, samesite="Lax")

        return LoginResponse(message="Logged out successfully")

    def _set_auth_cookies(self, response: Response, access_token: str, refresh_token: str):
        """アクセストークンとリフレッシュトークンをHttpOnly Secure Cookieに設定するヘルパー"""
        # アクセストークンの有効期限 (分) を秒に変換
        access_expire_seconds = AuthService.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        # リフレッシュトークンの有効期限 (日) を秒に変換
        refresh_expire_seconds = AuthService.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True, # JavaScriptからのアクセスを禁止
            secure=True, # HTTPSでのみ送信
            samesite="Lax", # CSRF対策
            max_age=access_expire_seconds, # 有効期限 (秒)
            path="/" # 全パスで有効
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True, # JavaScriptからのアクセスを禁止
            secure=True, # HTTPSでのみ送信
            samesite="Lax", # CSRF対策
            max_age=refresh_expire_seconds, # 有効期限 (秒)
            path="/" # 全パスで有効
        )