from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.activity import ActivityCategory, ActivityRead
from app.schemas.common import Page, PaginationParams, pagination_params
from app.services import activity as activity_service

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("", response_model=Page[ActivityRead])
def list_activities(
    db: Annotated[Session, Depends(get_db)],
    params: Annotated[PaginationParams, Depends(pagination_params)],
    q: str | None = None,
    category: ActivityCategory | None = None,
    entity_id: str | None = None,
    upcoming: bool | None = None,
) -> Page[ActivityRead]:
    items, total = activity_service.list_activities(
        db,
        params,
        q=q,
        category=category.value if category else None,
        entity_id=entity_id,
        upcoming=upcoming,
    )
    return Page(items=items, total=total, page=params.page, page_size=params.page_size)


@router.get("/{activity_id}", response_model=ActivityRead)
def get_activity(
    activity_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> ActivityRead:
    return activity_service.get_activity(db, activity_id)
