from fastapi import FastAPI
from app.routers import hello
from app.routers import rag

app = FastAPI()

app.include_router(hello.router, prefix="/hello")
app.include_router(rag.router, prefix="/rag")

@app.get("/")
def root():
    return {"message": "FastAPI backend is up!"}
