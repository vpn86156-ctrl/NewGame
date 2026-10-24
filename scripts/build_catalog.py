#!/usr/bin/env python3
"""Build TERRA Chronicle's complete item, recipe and acquisition catalog.

Usage: python scripts/build_catalog.py path/to/source-data src/data/full-catalog.json

Required source files come from Doeschi/Terraria-Progress-Tracker (game data and
sprites, CC BY-NC-SA 4.0), the Official Terraria Wiki localization mirrors, and
synchromic/terraria-npc-happiness (NPC preference data). See ATTRIBUTION.md.
"""
import json
import re
import sys
from pathlib import Path

source = Path(sys.argv[1] if len(sys.argv) > 1 else '.cache/tracker-data')
out = Path(sys.argv[2] if len(sys.argv) > 2 else 'src/data/full-catalog.json')

def load(name, default=None):
    path = source / name
    return json.loads(path.read_text()) if path.exists() else default

items = load('items.json')
recipe_data = load('recipes.json')
sprite_data = load('sprites.json')
meta = load('meta.json')
drop_data = load('drops.json', {'sources': {}, 'items': {}})
shop_data = load('shops.json', {})
vendors = load('vendors.json', [])
obtain_methods = load('obtain.json', [])
biomes = load('biomes.json', [])
events = load('events.json', [])
condition_data = load('conditions.json', {'conditions': []})
npc_preferences = load('npc-preferences.json', {'npcList': [], 'npcProps': {}})
by_key = {item['key']: item for item in items}

# The September 2026 wiki localization mirror is the primary source. AWU's
# Russian localization supplies a fallback for the few keys absent there.
ru_primary = load('db-ru.json', {}).get('ItemName', {})
ru_fallback = load('ru-items.json', {}).get('ItemName', {})
ru_tooltips = load('ru-items.json', {}).get('ItemTooltip', {})
ru_npc = load('ru-NPCs.json', {}).get('NPCName', {})
en_npc = load('en-NPCs-clean.json', {}).get('NPCName', {})

sprite_indexes = {}
compact_sprites = []
named_sprites = {}

def filename(url):
    return (url or '').rsplit('/', 1)[-1]

def add_sprite(icon):
    """Register an atlas icon and return its compact numeric sprite index."""
    if not icon:
        return None
    coordinates = sprite_data['icons'].get(icon)
    if coordinates is None:
        # A few wiki URLs contain encoded parentheses/apostrophes.
        from urllib.parse import unquote
        decoded = unquote(icon)
        coordinates = sprite_data['icons'].get(decoded)
        if coordinates is not None:
            icon = decoded
    if coordinates is None:
        return None
    signature = tuple(coordinates)
    if signature not in sprite_indexes:
        sprite_indexes[signature] = len(compact_sprites)
        compact_sprites.append(coordinates)
    index = sprite_indexes[signature]
    named_sprites[icon] = index
    return index

compact_items = {}
for item in items:
    key = item['key']
    sprite = add_sprite(filename(item.get('icon')))
    compact_item = {
        'name': item['name'],
        'sprite': sprite,
        'rarity': item.get('rarity', 0),
        'categories': item.get('categories', []),
        'subcategories': item.get('subcategories', []),
        'obtain': item.get('obtain', []),
        'biomes': item.get('biomes', []),
        'events': item.get('events', []),
        'vendors': item.get('vendors', []),
        'milestone': item.get('milestone', 'start'),
    }
    name_ru = ru_primary.get(key) or ru_fallback.get(key)
    if name_ru and name_ru != item['name']:
        compact_item['nameRu'] = name_ru
    if ru_tooltips.get(key):
        compact_item['tooltipRu'] = ru_tooltips[key]
    if key == 'EnchantedSword' and 'plunder' not in compact_item['obtain']:
        compact_item['obtain'].insert(0, 'plunder')
    for field in ('id', 'tooltip', 'damage', 'damageType', 'defense', 'pickaxePower',
                  'axePower', 'hammerPower', 'stack', 'url', 'unobtainable', 'otherForm'):
        if field in item and item[field] not in (False, None, ''):
            compact_item[field] = item[field]
    compact_items[key] = compact_item

sheet_names = [
    {'file': f'images/sprites/sheet-{index}.png', 'w': sheet['w'], 'h': sheet['h']}
    for index, sheet in enumerate(sprite_data['sheets'])
]

def normalize_name(value):
    return re.sub(r'[^a-z0-9]', '', value.lower())

# Match official English NPC display names to their Russian localization keys.
npc_names_ru = {}
for key, english in en_npc.items():
    if key in ru_npc:
        npc_names_ru.setdefault(normalize_name(english), ru_npc[key])
for key, russian in ru_npc.items():
    npc_names_ru.setdefault(normalize_name(key), russian)

manual_source_ru = {
    'the twins': 'Близнецы', 'mechdusa': 'Мехдуса', 'santa claus': 'Санта-Клаус',
    'traveling merchant': 'Странствующий торговец', 'skeleton merchant': 'Торговец-скелет',
    'old man': 'Старик', 'tavenkeep': 'Тавернщик', 'tavernkeep': 'Тавернщик',
    'chest': 'Сундук', 'gold chest': 'Золотой сундук', 'frozen chest': 'Ледяной сундук',
    'ice chest': 'Ледяной сундук', 'shadow chest': 'Теневой сундук',
    'skyware chest': 'Небесный сундук', 'living wood chest': 'Сундук живого дерева',
    'ivy chest': 'Сундук с плющом', 'water chest': 'Водный сундук',
    'web covered chest': 'Опутанный паутиной сундук', 'sandstone chest': 'Песчаниковый сундук',
    'golden crate': 'Золотой ящик', 'iron crate': 'Железный ящик', 'wooden crate': 'Деревянный ящик',
    'sky crate': 'Небесный ящик', 'azure crate': 'Лазурный ящик', 'ocean crate': 'Океанический ящик',
    'obsidian crate': 'Обсидиановый ящик', 'hellstone crate': 'Адский ящик',
    'golden lock box': 'Золотая запертая шкатулка', 'obsidian lock box': 'Обсидиановая запертая шкатулка',
    'goodie bag': 'Подарочный пакет', 'present': 'Подарок', 'herb bag': 'Мешок с травами',
    'crimson heart': 'Багровое сердце', 'shadow orb': 'Теневая сфера',
}

# Item icons also give us authentic Russian names for most containers and bags.
icon_names_ru = {}
for item in items:
    name_ru = ru_primary.get(item['key']) or ru_fallback.get(item['key'])
    if name_ru:
        icon_names_ru.setdefault(filename(item.get('icon')), name_ru)

def source_name_ru(source):
    english = source['name']
    normalized = normalize_name(english)
    if english.lower() in manual_source_ru:
        return manual_source_ru[english.lower()]
    if normalized in npc_names_ru:
        return npc_names_ru[normalized]
    icon_name = filename(source.get('icon'))
    if icon_name in icon_names_ru:
        return icon_names_ru[icon_name]
    if english.endswith(' (bonus drop)'):
        base = source_name_ru({**source, 'name': english[:-13]})
        return f'{base} (дополнительный дроп)'
    treasure = re.fullmatch(r'Treasure Bag \((.+)\)', english)
    if treasure:
        boss = source_name_ru({**source, 'name': treasure.group(1)})
        return f'Мешок сокровищ: {boss}'
    if english.startswith('Shaking '):
        tree_names = {
            'Forest tree': 'лесное дерево', 'Mahogany tree': 'красное дерево',
            'Boreal tree': 'дерево севера', 'Pearlwood tree': 'жемчужное дерево',
            'Ash tree': 'пепельное дерево', 'Giant Glowing Mushroom': 'гигантский светящийся гриб',
            'Ebonwood tree': 'эбонитовое дерево', 'Shadewood tree': 'теневое дерево',
            'Palm tree': 'пальма', 'Ebonwood Palm tree': 'эбонитовая пальма',
            'Shadewood Palm tree': 'теневая пальма', 'Pearlwood Palm tree': 'жемчужная пальма',
        }
        target = english[len('Shaking '):]
        return f'Встряхивание: {tree_names.get(target, target)}'
    return None

compact_sources = {}
for key, source_item in drop_data['sources'].items():
    icon = filename(source_item.get('icon'))
    add_sprite(icon)
    compact = {
        'name': source_item['name'], 'kind': source_item['kind'], 'icon': icon,
        'url': source_item.get('url'),
    }
    name_ru = source_name_ru(source_item)
    if name_ru and name_ru != compact['name']:
        compact['nameRu'] = name_ru
    for field in ('npcId', 'group', 'biomes', 'events', 'times', 'platforms'):
        if source_item.get(field):
            compact[field] = source_item[field]
    compact_sources[key] = compact

compact_vendors = {}
for vendor in vendors:
    icon = filename(vendor.get('icon'))
    add_sprite(icon)
    source_like = {'name': vendor['name'], 'icon': vendor['icon']}
    compact = {'name': vendor['name'], 'icon': icon}
    name_ru = source_name_ru(source_like)
    if name_ru:
        compact['nameRu'] = name_ru
    compact_vendors[vendor['id']] = compact

for method in obtain_methods + biomes + events + condition_data.get('conditions', []):
    add_sprite(filename(method.get('icon')))

npc_icon_names = {
    'partygirl': 'Party_Girl.png', 'tinkerer': 'Goblin_Tinkerer.png',
    'dyetrader': 'Dye_Trader.png', 'armsdealer': 'Arms_Dealer.png',
    'witchdoctor': 'Witch_Doctor.png', 'taxcollector': 'Tax_Collector.png',
    'santa': 'Santa_Claus.png',
}
npc_roles_ru = {
    'guide': 'Показывает рецепты и помогает освоиться в мире',
    'merchant': 'Базовые инструменты и припасы',
    'zoologist': 'Товары и награды за заполнение бестиария',
    'golfer': 'Клюшки, мячи и всё для гольфа',
    'nurse': 'Лечение и снятие дебаффов за монеты',
    'tavernkeep': 'Снаряжение для события «Армия Древних»',
    'partygirl': 'Праздничные товары, конфетти и ракеты',
    'wizard': 'Магические книги и редкие товары',
    'demolitionist': 'Бомбы, динамит и взрывчатка',
    'tinkerer': 'Перековка снаряжения и мастерская инженера',
    'clothier': 'Одежда, костюмы и ткани',
    'dyetrader': 'Краски и обмен странных растений',
    'armsdealer': 'Огнестрельное оружие и боеприпасы',
    'steampunker': 'Механизмы, телепорты и растворитель',
    'dryad': 'Семена, природа и сведения о заражении мира',
    'painter': 'Краски, картины и строительные инструменты',
    'witchdoctor': 'Тропические и призывные товары',
    'stylist': 'Причёски и краски для волос',
    'angler': 'Ежедневные рыболовные задания и награды',
    'pirate': 'Пиратские товары и пушка',
    'mechanic': 'Проводка, ловушки и механизмы',
    'taxcollector': 'Собирает налоги с других городских NPC',
    'cyborg': 'Ракеты и высокотехнологичные товары',
    'santa': 'Рождественские украшения и подарки',
    'truffle': 'Грибные товары и автомолот',
    'princess': 'Уникальные товары; по-особому относится к соседям',
}
compact_npcs = []
for npc_id in npc_preferences['npcList']:
    npc = npc_preferences['npcProps'][npc_id]
    icon = npc_icon_names.get(npc_id, '_'.join(part.capitalize() for part in npc_id.split('_')) + '.png')
    add_sprite(icon)
    name_ru = npc_names_ru.get(normalize_name(npc['name']))
    manual_npc_ru = {'princess': 'Принцесса', 'santa': 'Санта-Клаус', 'tavernkeep': 'Тавернщик'}
    compact_npcs.append({
        'id': npc_id, 'name': npc['name'], 'nameRu': manual_npc_ru.get(npc_id, name_ru),
        'icon': icon, 'biome': npc['biome'], 'neighbors': npc['neighbors'],
        'order': npc['order'], 'role': npc_roles_ru[npc_id],
        **({'special': 'princess'} if npc_id == 'princess' else {}),
        **({'special': 'santa'} if npc_id == 'santa' else {}),
    })

other_npcs = [
    {'id': 'traveling-merchant', 'name': 'Traveling Merchant', 'nameRu': 'Странствующий торговец', 'icon': 'Traveling_Merchant.png', 'role': 'Иногда приходит с редкими товарами; не заселяется в дом'},
    {'id': 'skeleton-merchant', 'name': 'Skeleton Merchant', 'nameRu': 'Торговец-скелет', 'icon': 'Skeleton_Merchant.png', 'role': 'Встречается в пещерах; ассортимент зависит от фазы Луны'},
    {'id': 'old-man', 'name': 'Old Man', 'nameRu': 'Старик', 'icon': 'Old_Man.png', 'role': 'Стоит у Данжа и призывает Скелетрона; не участвует в счастье'},
    {'id': 'town-cat', 'name': 'Town Cat', 'nameRu': 'Городская кошка', 'icon': 'Town_Cat.gif', 'role': 'Городской питомец; учитывается для пилонов, но не для тесноты'},
    {'id': 'town-dog', 'name': 'Town Dog', 'nameRu': 'Городская собака', 'icon': 'Town_Dog.gif', 'role': 'Городской питомец; учитывается для пилонов, но не для тесноты'},
    {'id': 'town-bunny', 'name': 'Town Bunny', 'nameRu': 'Городской кролик', 'icon': 'Town_Bunny.gif', 'role': 'Городской питомец; учитывается для пилонов, но не для тесноты'},
    {'id': 'squire-slime', 'name': 'Squire Slime', 'nameRu': 'Слизень-оруженосец', 'icon': 'Squire_Slime.png', 'role': 'Выбрось медный шлем или медный кинжал на обычного слизня'},
    {'id': 'clumsy-slime', 'name': 'Clumsy Slime', 'nameRu': 'Неуклюжий слизень', 'icon': 'Clumsy_Slime.png', 'role': 'Проколи шарик неуклюжего слизня на шарике'},
    {'id': 'nerdy-slime', 'name': 'Nerdy Slime', 'nameRu': 'Слизень-ботан', 'icon': 'Nerdy_Slime.png', 'role': 'Появляется после первой победы над Королём слизней'},
    {'id': 'surly-slime', 'name': 'Surly Slime', 'nameRu': 'Угрюмый слизень', 'icon': 'Surly_Slime.png', 'role': 'Вылавливается во время кровавой луны'},
    {'id': 'mystic-slime', 'name': 'Mystic Slime', 'nameRu': 'Таинственный слизень', 'icon': 'Mystic_Slime.png', 'role': 'Примени очищающий порошок на таинственной лягушке в джунглях'},
    {'id': 'elder-slime', 'name': 'Elder Slime', 'nameRu': 'Слизень-старейшина', 'icon': 'Elder_Slime.png', 'role': 'Открой старый дрожащий сундук золотым ключом после победы над Скелетроном'},
    {'id': 'cool-slime', 'name': 'Cool Slime', 'nameRu': 'Крутой слизень', 'icon': 'Cool_Slime.png', 'role': 'Может поселиться во время естественной вечеринки'},
    {'id': 'diva-slime', 'name': 'Diva Slime', 'nameRu': 'Слизень-дива', 'icon': 'Diva_Slime.gif', 'role': 'Погрузи блестящий слизевой шарик в Мерцание'},
]
for npc in other_npcs:
    add_sprite(npc['icon'])

# Curated visual routes fill acquisition gaps that structured drop tables cannot
# represent (background objects rather than enemies or containers).
acquisition_guides = {
    'EnchantedSword': [{
        'title': 'Святилище и меч в камне',
        'text': 'Исследуй подземный слой и длинные узкие тоннели святилищ. Разбей фоновый объект «меч в камне»: с шансом 96,67% выпадет Зачарованный меч, иначе — Террагрим.',
        'image': 'images/acquisition/enchanted-sword-shrine.png',
        'imageAlt': 'Настоящее святилище Зачарованного меча в Terraria',
        'rate': '96,67%', 'biome': 'Подземелье и святилища мечей',
        'url': 'https://terraria.wiki.gg/wiki/Enchanted_Sword_Shrine',
    }],
}

catalog = {
    'meta': {
        'gameVersion': meta['gameVersion'], 'dataVersion': meta['dataVersion'],
        'source': 'https://github.com/Doeschi/Terraria-Progress-Tracker',
        'license': 'CC BY-NC-SA 4.0', 'sourceItemCount': len(items),
        'itemCount': len(compact_items), 'recipeCount': len(recipe_data['recipes']),
        'dropSourceCount': len(compact_sources), 'npcCount': len(compact_npcs),
        'russianNameCount': sum('nameRu' in item for item in compact_items.values()),
    },
    'sheets': sheet_names, 'sprites': compact_sprites, 'namedSprites': named_sprites,
    'items': compact_items,
    'groups': {name: {'items': group['items']} for name, group in recipe_data['groups'].items()},
    'stations': list(recipe_data['stations']), 'recipes': recipe_data['recipes'],
    'sources': compact_sources, 'drops': drop_data['items'], 'shops': shop_data,
    'acquisitionGuides': acquisition_guides,
    'vendors': compact_vendors, 'obtainMethods': obtain_methods,
    'biomes': biomes, 'events': events, 'conditions': condition_data.get('conditions', []),
    'npcs': compact_npcs, 'otherNpcs': other_npcs,
}
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(catalog, ensure_ascii=False, separators=(',', ':')))
print(f"Built {out}: {len(compact_items)} items, {len(catalog['recipes'])} recipes, "
      f"{len(compact_sources)} drop sources, {len(compact_npcs)} NPCs, "
      f"{catalog['meta']['russianNameCount']} Russian names, {out.stat().st_size:,} bytes")
