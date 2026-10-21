from fastapi import APIRouter

from app.api.routes import activities, channels, entities, health, resources, services

api_router = APIRouter()

# Rutas técnicas en la raíz.
api_router.include_router(health.router)

# Rutas de negocio versionadas bajo /api/v1 (contratos en docs/API_CONTRACTS.md).
v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(entities.router)
v1_router.include_router(services.router)
v1_router.include_router(resources.router)
v1_router.include_router(activities.router)
v1_router.include_router(channels.router)

api_router.include_router(v1_router)
