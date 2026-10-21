from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.entity import Entity


def _seed(db: Session) -> None:
    db.add_all(
        [
            Entity(
                name="Secretaría de Salud", slug="secretaria-salud", kind="publica", verified=True
            ),
            Entity(name="Fundación Jóvenes", slug="fundacion-jovenes", kind="ong", verified=False),
            Entity(name="Casa de la Cultura", slug="casa-cultura", kind="publica", verified=True),
        ]
    )
    db.commit()


def test_list_entities_envelope(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)

    response = api_client.get("/api/v1/entities")

    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"items", "total", "page", "page_size"}
    assert body["total"] == 3
    assert body["page"] == 1
    assert body["page_size"] == 20
    assert len(body["items"]) == 3
    assert set(body["items"][0]) == {
        "id",
        "name",
        "slug",
        "kind",
        "description",
        "website",
        "verified",
        "created_at",
        "updated_at",
    }


def test_list_entities_pagination(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)

    response = api_client.get("/api/v1/entities", params={"page": 1, "page_size": 2})

    body = response.json()
    assert body["total"] == 3
    assert len(body["items"]) == 2
    assert body["page_size"] == 2


def test_list_entities_filters(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)

    assert api_client.get("/api/v1/entities", params={"kind": "ong"}).json()["total"] == 1
    assert api_client.get("/api/v1/entities", params={"verified": True}).json()["total"] == 2
    assert api_client.get("/api/v1/entities", params={"q": "salud"}).json()["total"] == 1


def test_invalid_kind_returns_422(api_client: TestClient) -> None:
    assert api_client.get("/api/v1/entities", params={"kind": "inexistente"}).status_code == 422


def test_invalid_pagination_returns_422(api_client: TestClient) -> None:
    assert api_client.get("/api/v1/entities", params={"page": 0}).status_code == 422
    assert api_client.get("/api/v1/entities", params={"page_size": 999}).status_code == 422


def test_get_entity_detail(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)
    entity = db_session.query(Entity).filter_by(slug="secretaria-salud").one()

    response = api_client.get(f"/api/v1/entities/{entity.id}")

    assert response.status_code == 200
    assert response.json()["slug"] == "secretaria-salud"


def test_get_entity_not_found(api_client: TestClient) -> None:
    response = api_client.get("/api/v1/entities/no-existe")

    assert response.status_code == 404
    assert response.json() == {"detail": "Entidad no encontrada"}
