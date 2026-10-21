from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class EntityKind(StrEnum):
    PUBLICA = "publica"
    ONG = "ong"
    PRIVADA = "privada"
    EDUCATIVA = "educativa"
    COMUNITARIA = "comunitaria"


class EntityRead(BaseModel):
    """Representación pública de una entidad. Ver docs/API_CONTRACTS.md → Entidades."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    kind: EntityKind
    description: str | None
    website: str | None
    verified: bool
    created_at: datetime
    updated_at: datetime
