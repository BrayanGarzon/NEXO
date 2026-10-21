from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class ServiceCategory(StrEnum):
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


class Modality(StrEnum):
    PRESENCIAL = "presencial"
    VIRTUAL = "virtual"
    MIXTO = "mixto"


class ServiceStatus(StrEnum):
    ACTIVO = "activo"
    INACTIVO = "inactivo"


class ServiceRead(BaseModel):
    """Representación pública de un servicio de apoyo.

    Ver docs/API_CONTRACTS.md → Servicios.
    """

    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    slug: str
    summary: str
    description: str | None
    category: ServiceCategory
    modality: Modality
    is_free: bool
    address: str | None
    latitude: float | None
    longitude: float | None
    status: ServiceStatus
    entity_id: str | None
    created_at: datetime
    updated_at: datetime
