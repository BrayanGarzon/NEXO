from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.schemas.health import DatabaseHealthResponse, HealthResponse
from app.services.health import is_database_available

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
def health(settings: Annotated[Settings, Depends(get_settings)]) -> HealthResponse:
    """Comprobación de vida de la API. No depende de la base de datos."""
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
    )


@router.get(
    "/db",
    response_model=DatabaseHealthResponse,
    responses={503: {"model": DatabaseHealthResponse}},
)
def database_health(
    response: Response, db: Annotated[Session, Depends(get_db)]
) -> DatabaseHealthResponse:
    """Comprobación de conectividad con PostgreSQL."""
    if is_database_available(db):
        return DatabaseHealthResponse(status="ok", database="up")
    response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return DatabaseHealthResponse(status="error", database="down")
