from fastapi import APIRouter, UploadFile, File
from app.services.upload import upload_file

router = APIRouter(prefix="/upload")

@router.post("/")
async def upload(file: UploadFile = File(...)):
    url = upload_file(file)
    return {"url": url}