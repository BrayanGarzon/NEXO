from typing import Annotated

from fastapi import Query
from pydantic import BaseModel


class Page[T](BaseModel):
    """Envoltorio de paginación común a todas las rutas de listado.

    Ver docs/API_CONTRACTS.md → «Envoltorio de paginación».
    """

    items: list[T]
    total: int
    page: int
    page_size: int


class PaginationParams(BaseModel):
    """Parámetros de paginación validados (`?page=&page_size=`)."""

    page: int = 1
    page_size: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def pagination_params(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> PaginationParams:
    """Dependencia de FastAPI que entrega parámetros de paginación validados."""
    return PaginationParams(page=page, page_size=page_size)
