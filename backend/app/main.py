import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.endpoints import categories, users, products, upload

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(categories.router, prefix="/api", tags=["Categories"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(products.router, prefix="/api", tags=["Products"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Semi-Project API"}