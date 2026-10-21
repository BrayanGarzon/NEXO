from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.db.session import get_db
from app.main import create_app


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "NEXO JOVEN 360 API"
    assert set(body) == {"status", "service", "version", "environment"}


class _FakeSession:
    def __init__(self, fail: bool) -> None:
        self.fail = fail

    def execute(self, _statement: object) -> None:
        if self.fail:
            raise OperationalError("SELECT 1", {}, Exception("sin conexión"))


def _client_with_db(fail: bool) -> TestClient:
    app = create_app()
    app.dependency_overrides[get_db] = lambda: _FakeSession(fail)
    return TestClient(app)


def test_database_health_up() -> None:
    response = _client_with_db(fail=False).get("/health/db")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "up"}


def test_database_health_down() -> None:
    response = _client_with_db(fail=True).get("/health/db")

    assert response.status_code == 503
    assert response.json() == {"status": "error", "database": "down"}
