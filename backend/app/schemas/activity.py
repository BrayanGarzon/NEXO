from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class ActivityCategory(StrEnum):
    TALLER = "taller"
    FERIA = "feria"
    CONVOCATORIA = "convocatoria"
    VOLUNTARIADO = "voluntariado"
    CULTURAL = "cultural"
    DEPORTIVO = "deportivo"
    FORMATIVO = "formativo"


class ActivityStatus(StrEnum):
    PROGRAMADA = "programada"
    EN_CURSO = "en_curso"
    FINALIZADA = "finalizada"
    CANCELADA = "cancelada"


class ActivityRead(BaseModel):
    """Representación pública de una actividad. Ver docs/API_CONTRACTS.md → Actividades."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    slug: str
    summary: str
    description: str | None
    category: ActivityCategory
    location: str | None
    latitude: float | None
    longitude: float | None
    start_at: datetime
    end_at: datetime | None
    is_free: bool
    registration_url: str | None
    status: ActivityStatus
    entity_id: str | None
    created_at: datetime
    updated_at: datetime
