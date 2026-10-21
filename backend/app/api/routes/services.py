from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.common import Page, PaginationParams, pagination_params
from app.schemas.service import Modality, ServiceCategory, ServiceRead
from app.services import service as service_service

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=Page[ServiceRead])
def list_services(
    db: Annotated[Session, Depends(get_db)],
    params: Annotated[PaginationParams, Depends(pagination_params)],
    q: str | None = None,
    category: ServiceCategory | None = None,
    modality: Modality | None = None,
    is_free: bool | None = None,
    entity_id: str | None = None,
) -> Page[ServiceRead]:
    items, total = service_service.list_services(
        db,
        params,
        q=q,
        category=category.value if category else None,
        modality=modality.value if modality else None,
        is_free=is_free,
        entity_id=entity_id,
    )
    return Page(items=items, total=total, page=params.page, page_size=params.page_size)


@router.get("/{service_id}", response_model=ServiceRead)
def get_service(
    service_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> ServiceRead:
    return service_service.get_service(db, service_id)
