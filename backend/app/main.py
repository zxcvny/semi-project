import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import categories

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(categories.router, prefix="/api", tags=["Categories"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Semi-Project API"}