#!/usr/bin/env python3
"""Build TERRA Chronicle's compact crafting catalog from Terraria Progress Tracker data.

Usage: python scripts/build_catalog.py path/to/source-data src/data/full-catalog.json
Source files required: items.json, recipes.json, sprites.json, meta.json.
Data and sprite sheets: CC BY-NC-SA 4.0, Official Terraria Wiki / Doeschi.
"""
import json
import sys
from pathlib import Path

source = Path(sys.argv[1] if len(sys.argv) > 1 else '.cache/tracker-data')
out = Path(sys.argv[2] if len(sys.argv) > 2 else 'src/data/full-catalog.json')
items = json.loads((source / 'items.json').read_text())
recipe_data = json.loads((source / 'recipes.json').read_text())
sprite_data = json.loads((source / 'sprites.json').read_text())
meta = json.loads((source / 'meta.json').read_text())
by_key = {item['key']: item for item in items}
extra = {
    'Wood', 'StoneBlock', 'Gel', 'Torch', 'IronBar', 'Lens', 'FallenStar', 'Cobweb',
    'SandBlock', 'Glass', 'Silk', 'HellstoneBar', 'Aglet', 'HermesBoots', 'CloudinaBottle',
    'MagicMirror', 'BandofRegeneration', 'Starfury', 'WaterBolt', 'LavaCharm',
}
used = {recipe['result'] for recipe in recipe_data['recipes']}
used |= {ingredient['item'] for recipe in recipe_data['recipes'] for ingredient in recipe['ingredients'] if 'item' in ingredient}
used |= {key for key in extra if key in by_key}
for group in recipe_data['groups'].values():
    used.update(key for key in group['items'] if key in by_key)

sprite_indexes = {}
compact_sprites = []
compact_items = {}
for key in sorted(used):
    item = by_key[key]
    filename = item['icon'].rsplit('/', 1)[-1]
    coordinates = sprite_data['icons'][filename]
    signature = tuple(coordinates)
    if signature not in sprite_indexes:
        sprite_indexes[signature] = len(compact_sprites)
        compact_sprites.append(coordinates)
    compact_item = {
        'name': item['name'],
        'sprite': sprite_indexes[signature],
        'rarity': item.get('rarity', 0),
        'categories': item.get('categories', []),
        'subcategories': item.get('subcategories', []),
        'milestone': item.get('milestone', 'start'),
    }
    for field in ('id', 'tooltip', 'damage', 'damageType', 'defense', 'pickaxePower', 'axePower', 'hammerPower', 'stack'):
        if field in item:
            compact_item[field] = item[field]
    compact_items[key] = compact_item

sheet_names = []
for index, sheet in enumerate(sprite_data['sheets']):
    sheet_names.append({'file': f'images/sprites/sheet-{index}.png', 'w': sheet['w'], 'h': sheet['h']})

catalog = {
    'meta': {
        'gameVersion': meta['gameVersion'],
        'dataVersion': meta['dataVersion'],
        'source': 'https://github.com/Doeschi/Terraria-Progress-Tracker',
        'license': 'CC BY-NC-SA 4.0',
        'sourceItemCount': len(items),
        'recipeCount': len(recipe_data['recipes']),
    },
    'sheets': sheet_names,
    'sprites': compact_sprites,
    'items': compact_items,
    'groups': {name: {'items': group['items']} for name, group in recipe_data['groups'].items()},
    'stations': list(recipe_data['stations']),
    'recipes': recipe_data['recipes'],
}
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(catalog, ensure_ascii=False, separators=(',', ':')))
print(f"Built {out}: {len(compact_items)} items, {len(catalog['recipes'])} recipes, {len(compact_sprites)} sprites, {out.stat().st_size:,} bytes")
