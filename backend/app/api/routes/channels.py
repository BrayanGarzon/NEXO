from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.channel import ChannelKind, ChannelRead
from app.schemas.common import Page, PaginationParams, pagination_params
from app.services import channel as channel_service

router = APIRouter(prefix="/channels", tags=["channels"])


@router.get("", response_model=Page[ChannelRead])
def list_channels(
    db: Annotated[Session, Depends(get_db)],
    params: Annotated[PaginationParams, Depends(pagination_params)],
    entity_id: str | None = None,
    kind: ChannelKind | None = None,
    is_emergency: bool | None = None,
) -> Page[ChannelRead]:
    items, total = channel_service.list_channels(
        db,
        params,
        entity_id=entity_id,
        kind=kind.value if kind else None,
        is_emergency=is_emergency,
    )
    return Page(items=items, total=total, page=params.page, page_size=params.page_size)
