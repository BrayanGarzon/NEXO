from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.common import Page, PaginationParams, pagination_params
from app.schemas.entity import EntityKind, EntityRead
from app.services import entity as entity_service

router = APIRouter(prefix="/entities", tags=["entities"])


@router.get("", response_model=Page[EntityRead])
def list_entities(
    db: Annotated[Session, Depends(get_db)],
    params: Annotated[PaginationParams, Depends(pagination_params)],
    q: str | None = None,
    kind: EntityKind | None = None,
    verified: bool | None = None,
) -> Page[EntityRead]:
    items, total = entity_service.list_entities(
        db,
        params,
        q=q,
        kind=kind.value if kind else None,
        verified=verified,
    )
    return Page(items=items, total=total, page=params.page, page_size=params.page_size)


@router.get("/{entity_id}", response_model=EntityRead)
def get_entity(
    entity_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> EntityRead:
    return entity_service.get_entity(db, entity_id)
