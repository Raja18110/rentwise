from fastapi import APIRouter, UploadFile, File
import shutil
import os

router = APIRouter(prefix="/upload")


# ✅ FILE UPLOAD
@router.post("/")
def upload_file(file: UploadFile = File(...)):
    
    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "msg": "File uploaded successfully",
        "filename": file.filename
    }