"""Modelos ORM.

Importar aquí cada modelo nuevo para que Alembic lo detecte en la autogeneración.
Los modelos de negocio se crearán cuando se aprueben los contratos
(ver docs/API_CONTRACTS.md).
"""

from app.db.base import Base

__all__ = ["Base"]
