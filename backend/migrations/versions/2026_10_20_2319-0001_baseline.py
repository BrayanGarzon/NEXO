"""baseline

Migración base vacía. Marca el punto de partida del esquema; los modelos de
negocio se añadirán en migraciones posteriores cuando se aprueben los contratos.

Revision ID: 0001
Revises:
Create Date: 2026-10-20 23:19:19.062351

"""

from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
