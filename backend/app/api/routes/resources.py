from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.common import Page, PaginationParams, pagination_params
from app.schemas.resource import ResourceFormat, ResourceRead, ResourceTopic
from app.services import resource as resource_service

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("", response_model=Page[ResourceRead])
def list_resources(
    db: Annotated[Session, Depends(get_db)],
    params: Annotated[PaginationParams, Depends(pagination_params)],
    q: str | None = None,
    format: ResourceFormat | None = None,
    topic: ResourceTopic | None = None,
) -> Page[ResourceRead]:
    items, total = resource_service.list_resources(
        db,
        params,
        q=q,
        format=format.value if format else None,
        topic=topic.value if topic else None,
    )
    return Page(items=items, total=total, page=params.page, page_size=params.page_size)


@router.get("/{resource_id}", response_model=ResourceRead)
def get_resource(
    resource_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> ResourceRead:
    return resource_service.get_resource(db, resource_id)
