from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.activity import Activity


def _seed(db: Session) -> None:
    db.add_all(
        [
            Activity(
                title="Taller de robótica",
                slug="taller-robotica",
                summary="Introducción a la robótica para jóvenes",
                category="taller",
                start_at=datetime(2026, 1, 10, 9, 0, tzinfo=UTC),
                is_free=True,
                status="programada",
                entity_id="ent-1",
            ),
            Activity(
                title="Feria de empleo juvenil",
                slug="feria-empleo",
                summary="Oportunidades laborales para jóvenes",
                category="feria",
                start_at=datetime(2026, 2, 15, 10, 0, tzinfo=UTC),
                is_free=True,
                status="programada",
                entity_id="ent-2",
            ),
            Activity(
                title="Convocatoria de voluntariado",
                slug="convocatoria-voluntariado",
                summary="Suma tu talento al barrio",
                category="convocatoria",
                start_at=datetime(2026, 3, 1, 8, 0, tzinfo=UTC),
                is_free=False,
                status="programada",
                entity_id="ent-1",
            ),
        ]
    )
    db.commit()


def test_list_activities_envelope(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)

    response = api_client.get("/api/v1/activities")

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
        "location",
        "latitude",
        "longitude",
        "start_at",
        "end_at",
        "is_free",
        "registration_url",
        "status",
        "entity_id",
        "created_at",
        "updated_at",
    }


def test_list_activities_pagination(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)

    response = api_client.get("/api/v1/activities", params={"page": 1, "page_size": 2})

    body = response.json()
    assert body["total"] == 3
    assert len(body["items"]) == 2
    assert body["page_size"] == 2


def test_list_activities_filters(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)

    assert api_client.get("/api/v1/activities", params={"category": "feria"}).json()["total"] == 1
    assert api_client.get("/api/v1/activities", params={"entity_id": "ent-1"}).json()["total"] == 2
    assert api_client.get("/api/v1/activities", params={"q": "robótica"}).json()["total"] == 1
    assert api_client.get("/api/v1/activities", params={"q": "talento"}).json()["total"] == 1


def test_list_activities_upcoming(api_client: TestClient, db_session: Session) -> None:
    db_session.add_all(
        [
            Activity(
                title="Actividad futura",
                slug="actividad-futura",
                summary="Ocurre pronto",
                category="cultural",
                start_at=datetime.now(UTC) + timedelta(days=10),
                is_free=True,
                status="programada",
            ),
            Activity(
                title="Actividad pasada",
                slug="actividad-pasada",
                summary="Ya ocurrió",
                category="cultural",
                start_at=datetime.now(UTC) - timedelta(days=10),
                is_free=True,
                status="finalizada",
            ),
        ]
    )
    db_session.commit()

    response = api_client.get("/api/v1/activities", params={"upcoming": True})

    assert response.status_code == 200
    assert response.json()["total"] == 1


def test_invalid_category_returns_422(api_client: TestClient) -> None:
    assert (
        api_client.get("/api/v1/activities", params={"category": "inexistente"}).status_code == 422
    )


def test_invalid_pagination_returns_422(api_client: TestClient) -> None:
    assert api_client.get("/api/v1/activities", params={"page": 0}).status_code == 422
    assert api_client.get("/api/v1/activities", params={"page_size": 999}).status_code == 422


def test_get_activity_detail(api_client: TestClient, db_session: Session) -> None:
    _seed(db_session)
    activity = db_session.query(Activity).filter_by(slug="taller-robotica").one()

    response = api_client.get(f"/api/v1/activities/{activity.id}")

    assert response.status_code == 200
    assert response.json()["slug"] == "taller-robotica"


def test_get_activity_not_found(api_client: TestClient) -> None:
    response = api_client.get("/api/v1/activities/no-existe")

    assert response.status_code == 404
    assert response.json() == {"detail": "Actividad no encontrada"}
