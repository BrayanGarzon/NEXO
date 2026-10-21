from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.models.resource import Resource
from app.schemas.common import PaginationParams
from app.services.common import paginate


def list_resources(
    db: Session,
    params: PaginationParams,
    *,
    q: str | None = None,
    format: str | None = None,
    topic: str | None = None,
) -> tuple[Sequence[Resource], int]:
    """Lista recursos con filtros opcionales y paginación."""
    stmt = select(Resource).order_by(Resource.title)
    if q:
        stmt = stmt.where(Resource.title.ilike(f"%{q}%") | Resource.summary.ilike(f"%{q}%"))
    if format is not None:
        stmt = stmt.where(Resource.format == format)
    if topic is not None:
        stmt = stmt.where(Resource.topic == topic)
    return paginate(db, stmt, params)


def get_resource(db: Session, resource_id: str) -> Resource:
    """Devuelve un recurso por su id o lanza `NotFoundError`."""
    resource = db.get(Resource, resource_id)
    if resource is None:
        raise NotFoundError("Recurso no encontrado")
    return resource
