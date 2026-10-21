"""Carga de datos semilla para desarrollo (tarea B5).

Prefiere los datos reales de `docs/contenido/*.json` (I3, a cargo de Elizabeth). Si esa carpeta
no existe o está vacía, usa el conjunto de ejemplo provisional de `app.db.seed_data`.

Uso:
    python -m app.db.seed            # carga en la base configurada por DATABASE_URL
    python -m app.db.seed --reset    # vacía las tablas de negocio antes de cargar

Es idempotente: no duplica filas (se identifican por `slug`; los canales, por
`entity + kind + value`). Las relaciones de los datos se expresan por `entity_slug`.
"""

import argparse
import json
from datetime import date, datetime
from pathlib import Path

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db import seed_data
from app.db.session import SessionLocal
from app.models.activity import Activity
from app.models.channel import Channel
from app.models.entity import Entity
from app.models.resource import Resource
from app.models.service import Service

# Raíz del repo → NEXO/docs/contenido (este archivo está en NEXO/backend/app/db/seed.py).
CONTENIDO_DIR = Path(__file__).resolve().parents[3] / "docs" / "contenido"
_FILES = ("entities", "services", "resources", "activities", "channels")


def load_dataset() -> tuple[dict[str, list[dict]], str]:
    """Devuelve `(datos, origen)`. `origen` es 'docs/contenido' o 'ejemplo (provisional)'."""
    if CONTENIDO_DIR.is_dir():
        data: dict[str, list[dict]] = {}
        found = False
        for name in _FILES:
            path = CONTENIDO_DIR / f"{name}.json"
            if path.is_file():
                found = True
                payload = json.loads(path.read_text(encoding="utf-8"))
                data[name] = payload.get("items", payload) if isinstance(payload, dict) else payload
            else:
                data[name] = []
        if found:
            return data, "docs/contenido"
    return seed_data.SAMPLE_DATA, "ejemplo (provisional)"


def _as_date(value: object) -> date | None:
    if value is None or isinstance(value, date):
        return value  # type: ignore[return-value]
    return date.fromisoformat(str(value))


def _as_datetime(value: object) -> datetime | None:
    if value is None or isinstance(value, datetime):
        return value  # type: ignore[return-value]
    return datetime.fromisoformat(str(value))


def reset(db: Session) -> None:
    """Vacía las tablas de negocio (respetando las claves foráneas)."""
    for model in (Service, Activity, Channel, Resource, Entity):
        db.execute(delete(model))
    db.commit()


def seed(db: Session, data: dict[str, list[dict]]) -> dict[str, int]:
    """Inserta los datos de forma idempotente. Devuelve el conteo por recurso."""
    counts = {name: 0 for name in _FILES}

    entities_by_slug: dict[str, Entity] = {e.slug: e for e in db.scalars(select(Entity)).all()}
    for item in data.get("entities", []):
        if item["slug"] in entities_by_slug:
            continue
        entity = Entity(**item)
        db.add(entity)
        entities_by_slug[entity.slug] = entity
        counts["entities"] += 1
    db.flush()

    existing_slugs = {
        "services": set(db.scalars(select(Service.slug)).all()),
        "resources": set(db.scalars(select(Resource.slug)).all()),
        "activities": set(db.scalars(select(Activity.slug)).all()),
    }

    for item in data.get("services", []):
        if item["slug"] in existing_slugs["services"]:
            continue
        payload = {k: v for k, v in item.items() if k != "entity_slug"}
        payload["entity_id"] = _entity_id(entities_by_slug, item.get("entity_slug"))
        db.add(Service(**payload))
        counts["services"] += 1

    for item in data.get("resources", []):
        if item["slug"] in existing_slugs["resources"]:
            continue
        payload = dict(item)
        payload["published_at"] = _as_date(item.get("published_at"))
        db.add(Resource(**payload))
        counts["resources"] += 1

    for item in data.get("activities", []):
        if item["slug"] in existing_slugs["activities"]:
            continue
        payload = {k: v for k, v in item.items() if k != "entity_slug"}
        payload["entity_id"] = _entity_id(entities_by_slug, item.get("entity_slug"))
        payload["start_at"] = _as_datetime(item.get("start_at"))
        payload["end_at"] = _as_datetime(item.get("end_at"))
        db.add(Activity(**payload))
        counts["activities"] += 1

    existing_channels = {(c.entity_id, c.kind, c.value) for c in db.scalars(select(Channel)).all()}
    for item in data.get("channels", []):
        entity_id = _entity_id(entities_by_slug, item.get("entity_slug"))
        key = (entity_id, item["kind"], item["value"])
        if key in existing_channels:
            continue
        payload = {k: v for k, v in item.items() if k != "entity_slug"}
        payload["entity_id"] = entity_id
        db.add(Channel(**payload))
        counts["channels"] += 1

    db.commit()
    return counts


def _entity_id(entities_by_slug: dict[str, Entity], slug: str | None) -> str | None:
    if not slug:
        return None
    entity = entities_by_slug.get(slug)
    if entity is None:
        raise ValueError(f"entity_slug desconocido en los datos semilla: {slug!r}")
    return entity.id


def main() -> None:
    parser = argparse.ArgumentParser(description="Carga datos semilla de NEXO JOVEN 360.")
    parser.add_argument("--reset", action="store_true", help="vacía las tablas antes de cargar")
    args = parser.parse_args()

    data, origin = load_dataset()
    with SessionLocal() as db:
        if args.reset:
            reset(db)
        counts = seed(db, data)

    total = sum(counts.values())
    print(f"Datos semilla cargados desde: {origin}")
    for name in _FILES:
        print(f"  {name}: +{counts[name]}")
    print(f"Total insertado: {total}")


if __name__ == "__main__":
    main()
