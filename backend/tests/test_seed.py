import json
from pathlib import Path

import pytest
from sqlalchemy.orm import Session

from app.db import seed as seed_module
from app.models.channel import Channel
from app.models.entity import Entity
from app.models.service import Service


def test_seed_loads_sample_data(db_session: Session) -> None:
    counts = seed_module.seed(db_session, seed_module.seed_data.SAMPLE_DATA)

    assert counts["entities"] == 3
    assert counts["services"] == 3
    assert counts["channels"] == 2
    assert db_session.query(Entity).count() == 3


def test_seed_resolves_entity_relationships(db_session: Session) -> None:
    seed_module.seed(db_session, seed_module.seed_data.SAMPLE_DATA)

    service = db_session.query(Service).filter_by(slug="orientacion-psicologica-gratuita").one()
    entity = db_session.query(Entity).filter_by(slug="secretaria-salud-villavicencio").one()
    assert service.entity_id == entity.id

    channel = db_session.query(Channel).filter_by(value="+57 300 000 0000").one()
    assert channel.entity_id == entity.id
    assert channel.is_emergency is True


def test_seed_is_idempotent(db_session: Session) -> None:
    seed_module.seed(db_session, seed_module.seed_data.SAMPLE_DATA)
    second = seed_module.seed(db_session, seed_module.seed_data.SAMPLE_DATA)

    assert sum(second.values()) == 0
    assert db_session.query(Entity).count() == 3


def test_load_dataset_falls_back_to_sample(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    # Apuntando a una carpeta sin archivos (I3 ausente) → usa el ejemplo provisional.
    monkeypatch.setattr(seed_module, "CONTENIDO_DIR", tmp_path / "no-existe")
    data, origin = seed_module.load_dataset()

    assert origin == "ejemplo (provisional)"
    assert len(data["entities"]) == 3


def test_load_dataset_prefers_contenido(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    # Simula I3: un entities.json real en docs/contenido debe tener prioridad.
    (tmp_path / "entities.json").write_text(
        json.dumps(
            {
                "fuente": "Prueba",
                "fecha": "2026-10-21",
                "items": [{"name": "X", "slug": "x", "kind": "publica", "verified": True}],
            }
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(seed_module, "CONTENIDO_DIR", tmp_path)
    data, origin = seed_module.load_dataset()

    assert origin == "docs/contenido"
    assert data["entities"] == [{"name": "X", "slug": "x", "kind": "publica", "verified": True}]
    assert data["services"] == []
