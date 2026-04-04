# import hashlib
# import hmac
# from typing import Optional

# from datatime import datetime, timedelta, timezone
# from jose import JWTError, jwt
# from passlib.context import CryptContext

# from app.core.config import settings

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

# ALGORITHM = "HS256"


# def hash_password(password: str) -> str:
#     return pwd_context.hash(password)


# def verify_password(plain: str, hashed: str) -> bool:
#     return pwd_context.verify(plain, hashed)


# def create_access_token(data: dict) -> str:
#     expire = datetime.now(timezone.utc) + timedelta(
#         minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
#     )
#     return jwt.encode({**data, "exp": expire}, settings.SECRET_KEY, algorithm=ALGORITHM)


# def create_refresh_token(data: dict) -> str:
#     expire = datetime.now(timezone.utc) + timedelta(
#         days=settings.REFRESH_TOKEN_EXPIRE_DAYS
#     )
#     return jwt.encode({**data, "exp": expire}, settings.SECRET_KEY, algorithm=ALGORITHM)


# def decode_token(token: str) -> Optional[dict]:
#     try:
#         payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
#         return payload
#     except JWTError:
#         return None


# def verify_whatsapp_signature(payload: bytes, signature_header: str) -> bool:
#     """Validate Meta X-Hub-Signature-256 header on every inbound webhook"""
#     expected = hmac.new(
#         settings.META_APP_SECRET.encode(), payload, hashlib.sha256
#     ).hexdigest()
#     return hmac.compare_digest(expected, signature_header.split("sha256=")[-1])
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from app.core.config import settings

# 🔐 Hash password (bcrypt)
def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


# 🔐 Verify password (bcrypt)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False

# 🔐 Create JWT token
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None