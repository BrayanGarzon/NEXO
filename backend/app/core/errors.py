"""Manejo de errores uniforme (tarea B6).

Todas las respuestas de error usan el formato `{ "detail": ... }` acordado en
docs/API_CONTRACTS.md. FastAPI ya devuelve ese formato para `HTTPException` y 422 de
validación; aquí añadimos una excepción de dominio «no encontrado» y una red de seguridad
para errores no controlados (500) que no filtra detalles internos.
"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger("nexo.errors")


class NotFoundError(Exception):
    """El recurso solicitado no existe. Se traduce a 404 `{ "detail": ... }`."""

    def __init__(self, detail: str = "Recurso no encontrado") -> None:
        self.detail = detail
        super().__init__(detail)


async def _not_found_handler(_request: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": exc.detail})


async def _unhandled_handler(_request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Error no controlado", exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Error interno del servidor"},
    )


def register_error_handlers(app: FastAPI) -> None:
    """Registra los manejadores de error de la aplicación."""
    app.add_exception_handler(NotFoundError, _not_found_handler)
    app.add_exception_handler(Exception, _unhandled_handler)
