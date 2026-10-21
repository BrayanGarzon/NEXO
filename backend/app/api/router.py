from fastapi import APIRouter

from app.api.routes import health

api_router = APIRouter()
api_router.include_router(health.router)

# Las rutas de negocio se registrarán bajo el prefijo /api/v1 cuando se
# aprueben los contratos (ver docs/API_CONTRACTS.md).
