from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


class AuthPayload(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=128)


app = FastAPI(title="Chat App Auth API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

users: dict[str, str] = {}
BASE_DIR = Path(__file__).resolve().parent


@app.post("/api/signup")
def signup(payload: AuthPayload):
    username = payload.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username is required.")
    if username in users:
        raise HTTPException(status_code=409, detail="Username already exists.")

    users[username] = payload.password
    return {"message": "Account created.", "username": username}


@app.post("/api/login")
def login(payload: AuthPayload):
    username = payload.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username is required.")

    stored_password = users.get(username)
    if stored_password is None or stored_password != payload.password:
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    return {"message": "Login successful.", "username": username}


app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="static")


@app.get("/health")
def health_check():
    return {"status": "ok"}
