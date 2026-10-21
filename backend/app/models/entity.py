from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import UUIDAuditBase


class Entity(UUIDAuditBase):
    """Organización o institución que ofrece servicios, actividades y canales.

    Ver docs/MODELO_DATOS.md → `entities`.
    """

    __tablename__ = "entities"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), nullable=False, unique=True, index=True)
    kind: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
