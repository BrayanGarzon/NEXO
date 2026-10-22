import json
from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


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
    # NoDecode: evita que pydantic-settings intente json.loads sobre el valor del entorno
    # antes del validador; así `split_cors_origins` recibe el string crudo y acepta JSON o comas.
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default=["http://localhost:5173"], alias="CORS_ORIGINS"
    )

    @field_validator("database_url")
    @classmethod
    def use_psycopg_driver(cls, value: str) -> str:
        """Render y otros proveedores entregan `postgresql://`; el driver instalado es psycopg 3."""
        for prefix in ("postgresql://", "postgres://"):
            if value.startswith(prefix):
                return "postgresql+psycopg://" + value.removeprefix(prefix)
        return value

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors_origins(cls, value: object) -> object:
        """Acepta una lista JSON o una cadena separada por comas (más cómoda en paneles)."""
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return value
            if stripped.startswith("["):
                return json.loads(stripped)
            return [origin.strip() for origin in stripped.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
