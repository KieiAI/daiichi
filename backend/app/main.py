from fastapi import FastAPI
from app.routers import hello

app = FastAPI()

app.include_router(hello.router, prefix="/hello")

@app.get("/")
def root():
    return {"message": "FastAPI backend is up!"}
