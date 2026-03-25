# routes/payment.py
from fastapi import APIRouter
router=APIRouter(prefix="/pay")

@router.post("/")
def pay(): return {"status":"success"}