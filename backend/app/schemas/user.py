from pydantic import BaseModel, EmailStr, constr


class RegisterSchema(BaseModel):
    email: EmailStr
    username: constr(min_length=1)
    password: constr(min_length=6)
    role: constr(min_length=1)


class LoginSchema(BaseModel):
    email: EmailStr
    password: str