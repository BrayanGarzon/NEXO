from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class ResourceFormat(StrEnum):
    ARTICULO = "articulo"
    VIDEO = "video"
    GUIA = "guia"
    PDF = "pdf"
    PODCAST = "podcast"
    ENLACE = "enlace"


class ResourceTopic(StrEnum):
    SALUD_MENTAL = "salud_mental"
    SALUD_SEXUAL = "salud_sexual"
    EMPLEO = "empleo"
    EDUCACION = "educacion"
    JURIDICO = "juridico"
    PREVENCION_CONSUMO = "prevencion_consumo"
    VIOLENCIA_GENERO = "violencia_genero"
    DISCAPACIDAD = "discapacidad"
    EMPRENDIMIENTO = "emprendimiento"
    DEPORTE_CULTURA = "deporte_cultura"


class ResourceRead(BaseModel):
    """Representación pública de un recurso. Ver docs/API_CONTRACTS.md → Recursos."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    slug: str
    summary: str
    format: ResourceFormat
    topic: ResourceTopic
    url: str | None
    body: str | None
    source: str | None
    published_at: date | None
    created_at: datetime
    updated_at: datetime
