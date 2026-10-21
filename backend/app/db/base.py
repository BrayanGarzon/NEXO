import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Clase base de todos los modelos ORM."""


def _new_uuid() -> str:
    return str(uuid.uuid4())


class UUIDAuditBase(Base):
    """Mixin base para modelos de negocio.

    Aporta identificador UUID como texto (portable entre PostgreSQL y SQLite) y columnas de
    auditoría `created_at` / `updated_at`. Ver docs/MODELO_DATOS.md (principios 1 y 2).
    """

    __abstract__ = True

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_uuid)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
