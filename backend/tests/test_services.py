from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.service import Service


def _seed(db: Session) -> None:
    db.add_all(
        [
            Service(
                title="Atención psicológica juvenil",
                slug="atencion-psicologica-juvenil",
                summary="Apoyo en salud mental para jóvenes",
                category="salud_mental",
                modality="presencial",
                is_free=True,
                status="activo",
                entity_id="ent-1",
            ),
            Service(
                title="Bolsa de empleo joven",
                slug="bolsa-empleo-joven",
                summary="Intermediación laboral para primer empleo",
                category="empleo",
                modality="virtual",
                is_free=True,
                status="activo",
                entity_id="ent-2",
            ),
            Service(
                title="Asesoría jurídica gratuita",
                slug="asesoria-juridica-gratuita",
                summary="Orientación legal en salud y derechos",
                category="juridico",
                modality="mixto",
                is_free=False,
                status="inactivo",
                entity_id="ent-1",
            ),
        ]
    )
    db.commit()


def test_list_services_envelope(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)

    response = api_client.get("/api/v1/services")

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
        "description",
        "category",
        "modality",
        "is_free",
        "address",
        "latitude",
        "longitude",
        "status",
        "entity_id",
        "created_at",
        "updated_at",
    }


def test_list_services_pagination(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)

    response = api_client.get("/api/v1/services", params={"page": 1, "page_size": 2})

    body = response.json()
    assert body["total"] == 3
    assert len(body["items"]) == 2
    assert body["page_size"] == 2


def test_list_services_filters(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)

    assert api_client.get("/api/v1/services", params={"category": "empleo"}).json()["total"] == 1
    assert api_client.get("/api/v1/services", params={"modality": "virtual"}).json()["total"] == 1
    assert api_client.get("/api/v1/services", params={"is_free": True}).json()["total"] == 2
    assert api_client.get("/api/v1/services", params={"entity_id": "ent-1"}).json()["total"] == 2
    assert api_client.get("/api/v1/services", params={"q": "empleo"}).json()["total"] == 1
    assert api_client.get("/api/v1/services", params={"q": "salud"}).json()["total"] == 2


def test_invalid_category_returns_422(api_client: TestClient) -> None:
    assert api_client.get("/api/v1/services", params={"category": "inexistente"}).status_code == 422


def test_invalid_modality_returns_422(api_client: TestClient) -> None:
    assert api_client.get("/api/v1/services", params={"modality": "inexistente"}).status_code == 422


def test_invalid_pagination_returns_422(api_client: TestClient) -> None:
    assert api_client.get("/api/v1/services", params={"page": 0}).status_code == 422
    assert api_client.get("/api/v1/services", params={"page_size": 999}).status_code == 422


def test_get_service_detail(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)
    service = db_session.query(Service).filter_by(slug="bolsa-empleo-joven").one()

    response = api_client.get(f"/api/v1/services/{service.id}")

    assert response.status_code == 200
    assert response.json()["slug"] == "bolsa-empleo-joven"


def test_get_service_not_found(api_client: TestClient) -> None:
    response = api_client.get("/api/v1/services/no-existe")

    assert response.status_code == 404
    assert response.json() == {"detail": "Servicio no encontrado"}
