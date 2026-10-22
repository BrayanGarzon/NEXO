"""service: comuna, horario, offerings, verified

Revision ID: 130343a6d715
Revises: 51b9e38bba96
Create Date: 2026-10-22 09:47:21.114093

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "130343a6d715"
down_revision: str | Sequence[str] | None = "51b9e38bba96"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("services", sa.Column("comuna", sa.Integer(), nullable=True))
    op.add_column("services", sa.Column("schedule", sa.String(length=200), nullable=True))
    # server_default para que las filas existentes queden con una lista vacía / no verificado.
    op.add_column(
        "services",
        sa.Column("offerings", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
    )
    op.add_column(
        "services",
        sa.Column("verified", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("services", "verified")
    op.drop_column("services", "offerings")
    op.drop_column("services", "schedule")
    op.drop_column("services", "comuna")
