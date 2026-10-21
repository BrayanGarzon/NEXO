from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import get_db
from app.main import create_app
from app.models import Base


@pytest.fixture
def client() -> TestClient:
    """Cliente sin base de datos (rutas técnicas y de configuración)."""
    return TestClient(create_app())


@pytest.fixture
def db_session() -> Iterator[Session]:
    """Sesión sobre SQLite en memoria con todas las tablas creadas.

    SQLite evita depender de PostgreSQL en las pruebas unitarias; el id UUID como texto y los
    tipos del modelo son portables (ver docs/MODELO_DATOS.md). StaticPool mantiene una única
    conexión para que la base en memoria persista entre peticiones del TestClient.
    """
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    testing_session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with testing_session() as session:
        yield session
    Base.metadata.drop_all(engine)


@pytest.fixture
def api_client(db_session: Session) -> Iterator[TestClient]:
    """Cliente cuya dependencia `get_db` usa la sesión SQLite de la prueba."""
    app = create_app()
    app.dependency_overrides[get_db] = lambda: db_session
    yield TestClient(app)
    app.dependency_overrides.clear()
