import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings


def test_openapi_is_exposed(client: TestClient) -> None:
    response = client.get("/openapi.json")

    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "NEXO JOVEN 360 API"
    assert "/health" in schema["paths"]


def test_docs_are_exposed(client: TestClient) -> None:
    assert client.get("/docs").status_code == 200


def test_cors_allows_configured_origin(client: TestClient) -> None:
    response = client.get("/health", headers={"Origin": "http://localhost:5173"})

    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_settings_read_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://u:p@db:5432/x")
    monkeypatch.setenv("CORS_ORIGINS", '["https://nexo.example"]')

    settings = Settings(_env_file=None)

    assert settings.environment == "test"
    assert settings.database_url == "postgresql+psycopg://u:p@db:5432/x"
    assert settings.cors_origins == ["https://nexo.example"]
