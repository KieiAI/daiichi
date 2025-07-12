from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.db.models import User, History

app = FastAPI()

@app.get("/health")
def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy", "message": "Application is running"}

@app.get("/")
def read_root():
    """ルートエンドポイント"""
    return {"message": "Daiichi Backend API"}

@app.get("/users/")
def read_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.get("/histories/")
def read_histories(db: Session = Depends(get_db)):
    histories = db.query(History).all()
    return histories