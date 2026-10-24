#!/usr/bin/env python3
"""Validate the generated catalog against its complete upstream snapshot."""
import json
from pathlib import Path

source = Path('.cache/tracker-data')
catalog = json.loads(Path('src/data/full-catalog.json').read_text())
items = json.loads((source / 'items.json').read_text())
recipes = json.loads((source / 'recipes.json').read_text())
sprites = json.loads((source / 'sprites.json').read_text())

assert len(items) == catalog['meta']['sourceItemCount'] == len(catalog['items']) == 6186
assert len(recipes['recipes']) == len(catalog['recipes']) == catalog['meta']['recipeCount'] == 3655
assert recipes['recipes'] == catalog['recipes'], 'Recipes differ from upstream'
assert catalog['meta']['gameVersion'] == '1.4.5'
assert catalog['meta']['russianNameCount'] >= 5400
assert len(catalog['sources']) == 488
assert len(catalog['npcs']) == 26
assert len(catalog['otherNpcs']) == 14

for key, item in catalog['items'].items():
    assert item['sprite'] is not None, f'Missing sprite: {key}'
    coordinates = catalog['sprites'][item['sprite']]
    sheet_index, x, y, width, height = coordinates
    sheet = catalog['sheets'][sheet_index]
    assert width > 0 and height > 0 and x >= 0 and y >= 0
    assert x + width <= sheet['w'] and y + height <= sheet['h'], f'Invalid sprite bounds: {key}'

for recipe in catalog['recipes']:
    assert recipe['result'] in catalog['items']
    for ingredient in recipe['ingredients']:
        if 'item' in ingredient:
            assert ingredient['item'] in catalog['items'], f"Missing ingredient {ingredient['item']}"
        else:
            assert ingredient['group'] in catalog['groups']
            assert all(key in catalog['items'] for key in catalog['groups'][ingredient['group']]['items'])

for key, drops in catalog['drops'].items():
    assert key in catalog['items'], f'Drop for unknown item: {key}'
    for drop in drops:
        assert drop['source'] in catalog['sources'], f"Unknown drop source {drop['source']}"
for key, source in catalog['sources'].items():
    assert source['icon'] in catalog['namedSprites'], f'Missing source icon: {key}'
for key, shops in catalog['shops'].items():
    assert key in catalog['items'], f'Shop for unknown item: {key}'
    assert all(shop['vendor'] in catalog['vendors'] for shop in shops)
for npc in catalog['npcs'] + catalog['otherNpcs']:
    assert npc['icon'] in catalog['namedSprites'], f"Missing NPC icon: {npc['id']}"
npc_ids = {npc['id'] for npc in catalog['npcs']}
for npc in catalog['npcs']:
    for neighbors in npc['neighbors'].values():
        assert all(neighbor in npc_ids for neighbor in neighbors)

assert catalog['items']['Zenith']['nameRu'].strip('«»') == 'Зенит'
assert 'plunder' in catalog['items']['EnchantedSword']['obtain']
assert catalog['acquisitionGuides']['EnchantedSword'][0]['rate'] == '96,67%'
assert Path('public/images/acquisition/enchanted-sword-shrine.png').exists()
zenith = [recipe for recipe in catalog['recipes'] if recipe['result'] == 'Zenith']
assert len(zenith) == 1 and len(zenith[0]['ingredients']) == 10
for ingredient in zenith[0]['ingredients']:
    key = ingredient['item']
    has_path = (
        any(recipe['result'] == key for recipe in catalog['recipes'])
        or bool(catalog['drops'].get(key)) or bool(catalog['shops'].get(key))
        or bool(catalog['items'][key].get('obtain'))
    )
    assert has_path, f'Zenith ingredient has no acquisition information: {key}'

print('Catalog validation passed:')
print(f"  {len(catalog['items']):,} items; {len(catalog['recipes']):,} exact recipes")
print(f"  {len(catalog['sources'])} drop sources; {len(catalog['vendors'])} vendors")
print(f"  {catalog['meta']['russianNameCount']:,} Russian item names; {sum('tooltipRu' in item for item in catalog['items'].values()):,} Russian tooltips")
print(f"  {len(catalog['npcs'])} preference NPCs + {len(catalog['otherNpcs'])} other town NPCs/pets")
print('  Zenith: Russian name, 10 ingredients, acquisition paths and sprites OK')
