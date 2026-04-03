# from functools import lru_cache

# from pydantic_settings import BaseSettings, PostgresDsn, RedisDsn


# class Settings(BaseSettings):
#     APP_ENV: str = "development"
#     SECRET_KEY: str
#     ACCESS_TOKEN_EXPIRE_MINUTES: int
#     REFRESH_TOKEN_EXPIRE_DAYS: int

#     DATABASE_URL: PostgresDsn
#     REDIS_URL: RedisDsn | None = None

#     GOOGLE_API_KEY: str

#     WHATSAPP_VERIFY_TOKEN: str
#     WHATSAPP_ACCESS_TOKEN: str
#     WHATSAPP_PHONE_NUMBER_ID: str
#     META_APP_SECRET: str

#     class Config:
#         env_file = ".env"
#         case_sensitive = True
#         extra = "ingnore"
#         env_file_encoding = "utf-8"


# @lru_cache()
# def get_settings() -> Settings:
#     return Settings()


# settings = get_settings()
from pydantic_settings import BaseSettings
import os

ENV_FILE = os.getenv("ENV_FILE", ".env")

class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    CHAPA_SECRET_KEY: str
    GEMINI_API_KEY: str | None = None

    class Config:
        env_file = ENV_FILE
        extra = "ignore"

settings = Settings()