from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import UUIDAuditBase


class Channel(UUIDAuditBase):
    """Canal institucional de contacto de una entidad (teléfono, WhatsApp, correo, etc.).

    Ver docs/MODELO_DATOS.md → `channels`.
    """

    __tablename__ = "channels"

    entity_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("entities.id"), nullable=False, index=True
    )
    kind: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(200), nullable=False)
    value: Mapped[str] = mapped_column(String(500), nullable=False)
    is_emergency: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
