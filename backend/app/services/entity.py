from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.models.entity import Entity
from app.schemas.common import PaginationParams
from app.services.common import paginate


def list_entities(
    db: Session,
    params: PaginationParams,
    *,
    q: str | None = None,
    kind: str | None = None,
    verified: bool | None = None,
) -> tuple[Sequence[Entity], int]:
    """Lista entidades con filtros opcionales y paginación."""
    stmt = select(Entity).order_by(Entity.name)
    if q:
        stmt = stmt.where(Entity.name.ilike(f"%{q}%"))
    if kind is not None:
        stmt = stmt.where(Entity.kind == kind)
    if verified is not None:
        stmt = stmt.where(Entity.verified == verified)
    return paginate(db, stmt, params)


def get_entity(db: Session, entity_id: str) -> Entity:
    """Devuelve una entidad por su id o lanza `NotFoundError`."""
    entity = db.get(Entity, entity_id)
    if entity is None:
        raise NotFoundError("Entidad no encontrada")
    return entity
