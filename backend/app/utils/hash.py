from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    # 🔥 FIX: truncate to 72 bytes (bcrypt limit)
    return pwd_context.hash(password[:72])


def verify_password(password: str, hashed: str):
    return pwd_context.verify(password[:72], hashed)