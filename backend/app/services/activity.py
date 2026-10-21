from collections.abc import Sequence
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.models.activity import Activity
from app.schemas.common import PaginationParams
from app.services.common import paginate


def list_activities(
    db: Session,
    params: PaginationParams,
    *,
    q: str | None = None,
    category: str | None = None,
    entity_id: str | None = None,
    upcoming: bool | None = None,
) -> tuple[Sequence[Activity], int]:
    """Lista actividades con filtros opcionales y paginación."""
    stmt = select(Activity).order_by(Activity.start_at)
    if q:
        stmt = stmt.where(Activity.title.ilike(f"%{q}%") | Activity.summary.ilike(f"%{q}%"))
    if category is not None:
        stmt = stmt.where(Activity.category == category)
    if entity_id is not None:
        stmt = stmt.where(Activity.entity_id == entity_id)
    if upcoming:
        stmt = stmt.where(Activity.start_at >= datetime.now(UTC))
    return paginate(db, stmt, params)


def get_activity(db: Session, activity_id: str) -> Activity:
    """Devuelve una actividad por su id o lanza `NotFoundError`."""
    activity = db.get(Activity, activity_id)
    if activity is None:
        raise NotFoundError("Actividad no encontrada")
    return activity
