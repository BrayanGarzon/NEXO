from datetime import date

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.resource import Resource


def _seed(db: Session) -> None:
    db.add_all(
        [
            Resource(
                title="Cuidado de la salud mental",
                slug="cuidado-salud-mental",
                summary="Guía práctica para el bienestar emocional",
                format="guia",
                topic="salud_mental",
                url="https://example.org/salud-mental",
                body="Contenido extenso sobre salud mental.",
                source="Ministerio de Salud",
                published_at=date(2025, 1, 15),
            ),
            Resource(
                title="Cómo buscar empleo joven",
                slug="buscar-empleo-joven",
                summary="Video con consejos para la primera búsqueda laboral",
                format="video",
                topic="empleo",
            ),
            Resource(
                title="Derechos laborales básicos",
                slug="derechos-laborales",
                summary="Artículo sobre derechos en el empleo",
                format="articulo",
                topic="empleo",
            ),
        ]
    )
    db.commit()


def test_list_resources_envelope(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)

    response = api_client.get("/api/v1/resources")

    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"items", "total", "page", "page_size"}
    assert body["total"] == 3
    assert body["page"] == 1
    assert body["page_size"] == 20
    assert len(body["items"]) == 3
    assert set(body["items"][0]) == {
        "id",
        "title",
        "slug",
        "summary",
        "format",
        "topic",
        "url",
        "body",
        "source",
        "published_at",
        "created_at",
        "updated_at",
    }


def test_list_resources_pagination(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)

    response = api_client.get("/api/v1/resources", params={"page": 1, "page_size": 2})

    body = response.json()
    assert body["total"] == 3
    assert len(body["items"]) == 2
    assert body["page_size"] == 2


def test_list_resources_filters(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)

    assert api_client.get("/api/v1/resources", params={"format": "video"}).json()["total"] == 1
    assert api_client.get("/api/v1/resources", params={"topic": "empleo"}).json()["total"] == 2
    assert api_client.get("/api/v1/resources", params={"q": "salud"}).json()["total"] == 1
    assert api_client.get("/api/v1/resources", params={"q": "derechos"}).json()["total"] == 1


def test_invalid_format_returns_422(api_client: TestClient) -> None:
    assert api_client.get("/api/v1/resources", params={"format": "inexistente"}).status_code == 422


def test_invalid_topic_returns_422(api_client: TestClient) -> None:
    assert api_client.get("/api/v1/resources", params={"topic": "inexistente"}).status_code == 422


def test_invalid_pagination_returns_422(api_client: TestClient) -> None:
    assert api_client.get("/api/v1/resources", params={"page": 0}).status_code == 422
    assert api_client.get("/api/v1/resources", params={"page_size": 999}).status_code == 422


def test_get_resource_detail(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)
    resource = db_session.query(Resource).filter_by(slug="cuidado-salud-mental").one()

    response = api_client.get(f"/api/v1/resources/{resource.id}")

    assert response.status_code == 200
    assert response.json()["slug"] == "cuidado-salud-mental"


def test_get_resource_not_found(api_client: TestClient) -> None:
    response = api_client.get("/api/v1/resources/no-existe")

    assert response.status_code == 404
    assert response.json() == {"detail": "Recurso no encontrado"}
