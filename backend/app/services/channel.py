from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.channel import Channel
from app.schemas.common import PaginationParams
from app.services.common import paginate


def list_channels(
    db: Session,
    params: PaginationParams,
    *,
    entity_id: str | None = None,
    kind: str | None = None,
    is_emergency: bool | None = None,
) -> tuple[Sequence[Channel], int]:
    """Lista canales con filtros opcionales y paginación."""
    stmt = select(Channel).order_by(Channel.label)
    if entity_id is not None:
        stmt = stmt.where(Channel.entity_id == entity_id)
    if kind is not None:
        stmt = stmt.where(Channel.kind == kind)
    if is_emergency is not None:
        stmt = stmt.where(Channel.is_emergency == is_emergency)
    return paginate(db, stmt, params)
