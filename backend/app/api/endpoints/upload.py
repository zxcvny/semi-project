import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os
from uuid import uuid4

router = APIRouter()

# 이미지를 저장할 디렉토리 (backend/app/static/images)
UPLOAD_DIR = "static/images"

# 서버 시작 시 디렉토리가 없으면 생성
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-images", status_code=201)
async def upload_images(files: List[UploadFile] = File(...)):
    """
    여러 개의 이미지 파일을 업로드하고, 저장된 파일의 URL 목록을 반환합니다.
    """
    image_urls = []
    for file in files:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="이미지 파일만 업로드할 수 있습니다.")

        # 파일 이름이 중복되지 않도록 고유한 이름 생성 (UUID 사용)
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        finally:
            file.file.close()

        # 클라이언트가 접근할 수 있는 URL 경로
        image_url = f"/static/images/{unique_filename}"
        image_urls.append(image_url)

    return {"image_urls": image_urls}