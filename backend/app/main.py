import os
from app.middleware.auth_middleware import AuthMiddleware
from app.routers import auth
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.db.models import User, History
from app.usecases.user_usecase import UserUseCase
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware


app = FastAPI()
SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY")


origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # Cookieを許可するために必要
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET_KEY)
app.add_middleware(AuthMiddleware)

app.include_router(auth.router, prefix="/api/v1", tags=[""])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(auth.router, prefix="/api/v1/user", tags=["user"])


@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Application is running"}

@app.get("/")
def read_root():
    return {"message": "Daiichi Backend API"}


