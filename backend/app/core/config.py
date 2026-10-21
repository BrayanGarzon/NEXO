from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración centralizada, leída de variables de entorno y del archivo .env."""

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "NEXO JOVEN 360 API"
    app_version: str = "0.1.0"
    environment: str = Field(default="development", alias="APP_ENV")
    debug: bool = Field(default=False, alias="APP_DEBUG")
    database_url: str = Field(
        default="postgresql+psycopg://nexo:nexo_local_dev@localhost:5432/nexo_joven_360",
        alias="DATABASE_URL",
    )
    cors_origins: list[str] = Field(default=["http://localhost:5173"], alias="CORS_ORIGINS")


@lru_cache
def get_settings() -> Settings:
    return Settings()
