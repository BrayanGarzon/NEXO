from sqlalchemy import JSON, Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import UUIDAuditBase


class Service(UUIDAuditBase):
    """Servicio de apoyo ofrecido a jóvenes por una entidad.

    Ver docs/MODELO_DATOS.md → `services`.
    """

    __tablename__ = "services"

    title: Mapped[str] = mapped_column(String(300), nullable=False)
    slug: Mapped[str] = mapped_column(String(300), nullable=False, unique=True, index=True)
    summary: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    modality: Mapped[str] = mapped_column(String(16), nullable=False)
    is_free: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    comuna: Mapped[int | None] = mapped_column(Integer, nullable=True)
    schedule: Mapped[str | None] = mapped_column(String(200), nullable=True)
    offerings: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    address: Mapped[str | None] = mapped_column(String(300), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="activo")
    entity_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("entities.id"), nullable=True, index=True
    )
