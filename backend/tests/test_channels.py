from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.channel import Channel
from app.models.entity import Entity


def _seed(db: Session) -> str:
    entity = Entity(
        name="Secretaría de Salud", slug="secretaria-salud", kind="publica", verified=True
    )
    db.add(entity)
    db.commit()
    db.add_all(
        [
            Channel(
                entity_id=entity.id,
                kind="whatsapp",
                label="Línea de escucha",
                value="+57 300 000 0000",
                is_emergency=True,
            ),
            Channel(
                entity_id=entity.id,
                kind="telefono",
                label="Conmutador",
                value="6076000000",
                is_emergency=False,
            ),
            Channel(
                entity_id=entity.id,
                kind="correo",
                label="Atención al ciudadano",
                value="contacto@salud.gov.co",
                is_emergency=False,
            ),
        ]
    )
    db.commit()
    return entity.id


def test_list_channels_envelope(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)

    response = api_client.get("/api/v1/channels")

    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"items", "total", "page", "page_size"}
    assert body["total"] == 3
    assert body["page"] == 1
    assert body["page_size"] == 20
    assert len(body["items"]) == 3
    assert set(body["items"][0]) == {
        "id",
        "entity_id",
        "kind",
        "label",
        "value",
        "is_emergency",
        "created_at",
        "updated_at",
    }


def test_list_channels_pagination(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)

    response = api_client.get("/api/v1/channels", params={"page": 1, "page_size": 2})

    body = response.json()
    assert body["total"] == 3
    assert len(body["items"]) == 2
    assert body["page_size"] == 2


def test_list_channels_filters(api_client: TestClient, db_session: Session) -> None:
    entity_id = _seed(db_session)

    assert api_client.get("/api/v1/channels", params={"kind": "whatsapp"}).json()["total"] == 1
    assert api_client.get("/api/v1/channels", params={"is_emergency": True}).json()["total"] == 1
    assert api_client.get("/api/v1/channels", params={"entity_id": entity_id}).json()["total"] == 3
    assert (
        api_client.get("/api/v1/channels", params={"entity_id": "no-existe"}).json()["total"] == 0
    )


def test_invalid_kind_returns_422(api_client: TestClient) -> None:
    assert api_client.get("/api/v1/channels", params={"kind": "inexistente"}).status_code == 422


def test_invalid_pagination_returns_422(api_client: TestClient) -> None:
    assert api_client.get("/api/v1/channels", params={"page": 0}).status_code == 422
    assert api_client.get("/api/v1/channels", params={"page_size": 999}).status_code == 422
