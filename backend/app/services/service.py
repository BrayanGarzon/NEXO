from collections.abc import Sequence

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.models.service import Service
from app.schemas.common import PaginationParams
from app.services.common import paginate


def list_services(
    db: Session,
    params: PaginationParams,
    *,
    q: str | None = None,
    category: str | None = None,
    modality: str | None = None,
    is_free: bool | None = None,
    entity_id: str | None = None,
) -> tuple[Sequence[Service], int]:
    """Lista servicios de apoyo con filtros opcionales y paginación."""
    stmt = select(Service).order_by(Service.title)
    if q:
        stmt = stmt.where(or_(Service.title.ilike(f"%{q}%"), Service.summary.ilike(f"%{q}%")))
    if category is not None:
        stmt = stmt.where(Service.category == category)
    if modality is not None:
        stmt = stmt.where(Service.modality == modality)
    if is_free is not None:
        stmt = stmt.where(Service.is_free == is_free)
    if entity_id is not None:
        stmt = stmt.where(Service.entity_id == entity_id)
    return paginate(db, stmt, params)


def get_service(db: Session, service_id: str) -> Service:
    """Devuelve un servicio por su id o lanza `NotFoundError`."""
    service = db.get(Service, service_id)
    if service is None:
        raise NotFoundError("Servicio no encontrado")
    return service
