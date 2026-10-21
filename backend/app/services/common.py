from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session
from sqlalchemy.sql import Select

from app.schemas.common import PaginationParams


def paginate(db: Session, stmt: Select, params: PaginationParams) -> tuple[Sequence, int]:
    """Ejecuta `stmt` paginado y devuelve `(items, total)`.

    `total` cuenta el total de filas que coinciden con el filtro (antes de paginar), para que
    las rutas construyan el envoltorio `Page`. Ver docs/API_CONTRACTS.md.
    """
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = db.scalars(stmt.offset(params.offset).limit(params.page_size)).all()
    return items, total
