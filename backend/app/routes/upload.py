# routes/upload.py
from fastapi import APIRouter, UploadFile
import shutil

router = APIRouter(prefix="/upload")

@router.post("/")
def upload(file: UploadFile):
    with open(f"uploads/{file.filename}","wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename}