from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class ChannelKind(StrEnum):
    TELEFONO = "telefono"
    WHATSAPP = "whatsapp"
    CORREO = "correo"
    WEB = "web"
    PRESENCIAL = "presencial"
    RED_SOCIAL = "red_social"


class ChannelRead(BaseModel):
    """Representación pública de un canal. Ver docs/API_CONTRACTS.md → Canales institucionales."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    entity_id: str
    kind: ChannelKind
    label: str
    value: str
    is_emergency: bool
    created_at: datetime
    updated_at: datetime
