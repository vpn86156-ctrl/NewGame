#!/usr/bin/env python3
"""Add version/platform metadata to an existing compact catalog.

Usage: python scripts/enrich_catalog.py .cache/tracker-data/items.json
The full generator writes these fields too; this utility upgrades older snapshots
without requiring the localization and sprite source files again.
"""
import json
import sys
from pathlib import Path

source_path = Path(sys.argv[1] if len(sys.argv) > 1 else '.cache/tracker-data/items.json')
catalog_path = Path(sys.argv[2] if len(sys.argv) > 2 else 'src/data/full-catalog.json')
source_items = json.loads(source_path.read_text())
catalog = json.loads(catalog_path.read_text())
assert len(source_items) == len(catalog['items'])

for source in source_items:
    key = source['key']
    item = catalog['items'][key]
    assert item['name'] == source['name'], f'Upstream item mismatch: {key}'
    if source.get('version'):
        item['version'] = source['version']
    if source.get('introduced'):
        item['introduced'] = source['introduced']
    item['platforms'] = source.get('platforms', [])

# Confirmed by the current AWU Russian game localization. Empty localization
# values and unobtainable internal objects are deliberately not auto-translated.
catalog['items']['GPS']['nameRu'] = 'Навигатор'
catalog['meta']['russianNameCount'] = sum('nameRu' in item for item in catalog['items'].values())

curated_guides = catalog.setdefault('acquisitionGuides', {})
curated_guides.update({
    'FallenStar': [{
        'title': 'Звёзды падают ночью',
        'text': 'Ночью исследуй поверхность и собирай светящиеся звёзды до рассвета. Они появляются на блоках и платформах, а утром исчезают.',
        'rate': 'Ночью', 'biome': 'Поверхность мира',
        'url': 'https://terraria.wiki.gg/wiki/Fallen_Star',
    }],
    'NaturesGift': [{
        'title': 'Синий цветок в джунглях',
        'text': 'Ищи небольшой синий цветок на траве в подземных джунглях. Срежь его инструментом или оружием, чтобы получить Дар природы.',
        'rate': 'Объект в мире', 'biome': 'Подземные джунгли',
        'url': 'https://terraria.wiki.gg/wiki/Nature%27s_Gift',
    }],
    'WaterBolt': [{
        'title': 'Книга на полках Данжа',
        'text': 'Осматривай книжные полки в Данже: нужная книга стоит отдельно и имеет синее оформление. Разбей её, но не заходи глубоко до победы над Скелетроном.',
        'rate': 'Находка', 'biome': 'Данж',
        'url': 'https://terraria.wiki.gg/wiki/Water_Bolt',
    }],
})

catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, separators=(',', ':')))
print(f"Enriched {len(source_items)} items with version/platform metadata")
print(f"Russian names: {catalog['meta']['russianNameCount']}; visual/text guides: {len(curated_guides)}")
