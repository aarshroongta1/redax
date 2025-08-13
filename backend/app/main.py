from fastapi import FastAPI
from app.routes.routes import router as api_router
from app.routes.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.db.init_db import init_db

app = FastAPI(title="PII Redaction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Filename"],
)

init_db()

app.include_router(api_router)
app.include_router(auth_router)
