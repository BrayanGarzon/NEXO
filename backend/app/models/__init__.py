"""Modelos ORM.

Importar aquí cada modelo nuevo para que Alembic lo detecte en la autogeneración y para que
`Base.metadata` incluya todas las tablas (usado también por las pruebas con SQLite).
Ver docs/MODELO_DATOS.md.
"""

from app.db.base import Base
from app.models.activity import Activity
from app.models.channel import Channel
from app.models.entity import Entity
from app.models.resource import Resource
from app.models.service import Service

__all__ = ["Base", "Activity", "Channel", "Entity", "Resource", "Service"]
