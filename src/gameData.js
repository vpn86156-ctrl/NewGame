import catalog from './data/full-catalog.json';

export const gameCatalog = catalog;
export const gameItems = catalog.items;

export const itemNameRu = {
  WorkBench: 'Верстак', WoodenSword: 'Деревянный меч', WoodenBow: 'Деревянный лук', Torch: 'Факел',
  IronAnvil: 'Железная наковальня', Campfire: 'Костёр', Furnace: 'Печь', IronPickaxe: 'Железная кирка',
  IronHelmet: 'Железный шлем', ManaCrystal: 'Кристалл маны', SuspiciousLookingEye: 'Подозрительный глаз',
  Silk: 'Шёлк', Glass: 'Стекло', Bottle: 'Бутылка', MoltenPickaxe: 'Раскалённая кирка',
  Wood: 'Древесина', StoneBlock: 'Камень', Gel: 'Гель', IronBar: 'Железный слиток', Lens: 'Линза',
  FallenStar: 'Падшая звезда', Cobweb: 'Паутина', SandBlock: 'Песок', HellstoneBar: 'Адский слиток',
  Aglet: 'Шнурок', HermesBoots: 'Сапоги Гермеса', CloudinaBottle: 'Облако в бутылке',
  MagicMirror: 'Волшебное зеркало', BandofRegeneration: 'Браслет регенерации', Starfury: 'Звёздная ярость',
  WaterBolt: 'Водный снаряд', LavaCharm: 'Лавовый амулет', CopperPickaxe: 'Медная кирка',
  CopperShortsword: 'Медный короткий меч', WoodenArrow: 'Деревянная стрела', WoodenHammer: 'Деревянный молот',
  WoodenArmor: 'Деревянная броня', WoodenHelmet: 'Деревянный шлем', WoodenBreastplate: 'Деревянный нагрудник',
  WoodenGreaves: 'Деревянные поножи', LifeCrystal: 'Кристалл жизни', Chest: 'Сундук', Bed: 'Кровать',
  GoldBar: 'Золотой слиток', PlatinumBar: 'Платиновый слиток', SilverBar: 'Серебряный слиток',
  LeadBar: 'Свинцовый слиток', DemoniteBar: 'Демонитовый слиток', CrimtaneBar: 'Багрянцевый слиток',
  Hellstone: 'Адский камень', Obsidian: 'Обсидиан', MeteoriteBar: 'Метеоритный слиток',
  NightmarePickaxe: 'Кошмарная кирка', DeathbringerPickaxe: 'Кирка смертоносца',
  SlimeCrown: 'Корона слизней', Abeemination: 'Абоминация', MechanicalEye: 'Механический глаз',
  MechanicalWorm: 'Механический червь', MechanicalSkull: 'Механический череп', CelestialSigil: 'Небесная печать',
};

export const categoryLabels = {
  all: 'Все', weapon: 'Оружие', ammunition: 'Боеприпасы', tool: 'Инструменты', armor: 'Броня',
  accessory: 'Аксессуары', 'crafting-material': 'Материалы', furniture: 'Мебель',
  'crafting-station': 'Станции крафта', potion: 'Зелья', block: 'Блоки', wall: 'Стены',
  vanity: 'Внешность', 'light-source': 'Освещение', mechanism: 'Механизмы', storage: 'Хранилища',
  pet: 'Питомцы', mount: 'Средства передвижения', dye: 'Краски', food: 'Еда и напитки',
  summon: 'Призыв существ', miscellaneous: 'Разное', banner: 'Знамёна', seeds: 'Семена',
  bait: 'Наживка', 'grab-bag': 'Наборы и сумки', consumable: 'Расходные предметы',
  'permanent-booster': 'Постоянные усиления', key: 'Ключи', crate: 'Ящики', sets: 'Комплекты',
  developer: 'Предметы разработчиков',
};

export const stationLabels = {
  Autohammer: 'Автомолот', 'Blend-O-Matic': 'Бленд-о-матик', 'Decay Chamber': 'Камера разложения',
  'Dye Vat': 'Красильный чан', Honey: 'Рядом с мёдом', 'Imbuing Station': 'Станция зачарования',
  Keg: 'Пивная бочка', Lava: 'Рядом с лавой', 'Meat Grinder': 'Мясорубка',
  'Steampunk Boiler': 'Стимпанк-бойлер', Teapot: 'Чайник', 'Chlorophyte Extractinator': 'Хлорофитовый экстрактинатор',
  'Adamantite Forge': 'Адамантитовая или титановая кузница', 'Demon Altar': 'Демонический или багровый алтарь',
  'Cooking Pot': 'Котёл или казан', Hellforge: 'Адская кузница', 'Flesh Cloning Vat': 'Чан клонирования плоти',
  'Glass Kiln': 'Стекольная печь', 'Honey Dispenser': 'Медовый диспенсер', Loom: 'Ткацкий станок',
  'Ecto Mist': 'Рядом с эктотуманом', 'Ice Machine': 'Ледяная машина', 'Living Loom': 'Живой ткацкий станок',
  'Sky Mill': 'Небесная мельница', Water: 'Рядом с водой', 'Snow Biome': 'В снежном биоме',
  Campfire: 'Костёр', 'Bone Welder': 'Костяной сварочный аппарат', Bookcase: 'Книжный шкаф',
  Sawmill: 'Лесопилка', Solidifier: 'Затвердитель', 'Lihzahrd Furnace': 'Печь лихзардов',
  'Heavy Assembler': 'Тяжёлая сборочная станция', 'Ancient Manipulator': 'Древний манипулятор',
  'By Hand': 'Вручную', 'Crystal Ball': 'Хрустальный шар', Furnace: 'Печь', 'Work Bench': 'Верстак',
  "Tinkerer's Workshop": 'Мастерская механика', 'Placed Bottle': 'Установленная бутылка',
  'Mythril Anvil': 'Мифриловая или орихалковая наковальня', 'Iron Anvil': 'Железная или свинцовая наковальня',
};

export const groupLabels = {
  'Any Wood': 'Любая древесина', 'Any Iron Bar': 'Железный или свинцовый слиток',
  'Any Silver Bar': 'Серебряный или вольфрамовый слиток', 'Any Gold Bar': 'Золотой или платиновый слиток',
  'Any Cobalt Bar': 'Кобальтовый или палладиевый слиток', 'Any Mythril Bar': 'Мифриловый или орихалковый слиток',
  'Any Adamantite Bar': 'Адамантитовый или титановый слиток', 'Any Sand Block': 'Любой блок песка',
  'Any Stone Block': 'Любой блок камня', 'Any Pressure Plate': 'Любая нажимная плита',
  'Any Bird': 'Любая птица', 'Any Scorpion': 'Любой скорпион', 'Any Squirrel': 'Любая белка',
  'Any Jungle Bug': 'Любое насекомое джунглей', 'Any Duck': 'Любая утка', 'Any Butterfly': 'Любая бабочка',
  'Any Firefly': 'Любой светлячок', 'Any Snail': 'Любая улитка', 'Any Turtle': 'Любая черепаха',
  'Any Macaw': 'Любой ара', 'Any Cockatiel': 'Любой какаду', 'Any Dragonfly': 'Любая стрекоза',
  'Any Gem Critter': 'Любое самоцветное существо', 'Any Fruit': 'Любой фрукт',
  'Any Cloud Balloon': 'Любой облачный шар', 'Any Blizzard Balloon': 'Любой шар метели',
  'Any Sandstorm Balloon': 'Любой шар песчаной бури', 'Any Balloon': 'Любой воздушный шар',
  'Any Guide to Critter Companionship': 'Любой справочник по дружбе с существами',
  'Any Guide to Environmental Preservation': 'Любой справочник по охране природы',
  'Any Seashell or Starfish': 'Ракушка или морская звезда', 'Any Magic Mirror': 'Любое волшебное зеркало',
  'Any Torch': 'Любой факел', 'Recorded Music Boxes': 'Записанные музыкальные шкатулки',
};

const rarityColors = ['#a8b5ad', '#82d5f8', '#d5f96f', '#f0ae62', '#ef8b8b', '#ef89b5', '#c4a7ff', '#d5f96f', '#f7df72', '#70e4c1', '#ef6f6c', '#df80ff'];
const milestoneStages = {
  start: 0, 'king-slime': 1, 'eye-of-cthulhu': 2, 'evil-boss': 3, 'queen-bee': 4,
  deerclops: 4, skeletron: 4, 'wall-of-flesh': 5, 'queen-slime': 6, 'any-mech': 6,
  'all-mechs': 6, plantera: 7, golem: 8, 'duke-empress': 9, 'lunatic-cultist': 9, 'moon-lord': 10,
};

export const obtainItemKeys = {
  aglet: 'Aglet', 'hermes-boots': 'HermesBoots', 'cloud-bottle': 'CloudinaBottle',
  'magic-mirror': 'MagicMirror', 'band-regeneration': 'BandofRegeneration', starfury: 'Starfury',
  'water-bolt': 'WaterBolt', 'lava-charm': 'LavaCharm',
};

export function getItem(key) {
  return key ? gameItems[key] : null;
}

export function getItemName(key) {
  return getItem(key)?.nameRu || itemNameRu[key] || getItem(key)?.name || key || 'Неизвестный предмет';
}

export function normalizeSearch(value = '') {
  return String(value).toLowerCase().replace(/ё/g, 'е').replace(/[«»„“”"'_()\-–—]/g, ' ').replace(/[^a-zа-я0-9%+.\s]/gi, ' ').replace(/\s+/g, ' ').trim();
}

export function matchesSearch(searchText, query) {
  const normalized = normalizeSearch(query);
  if (!normalized) return true;
  const haystack = normalizeSearch(searchText);
  return normalized.split(' ').every((token) => haystack.includes(token));
}

export function getItemColor(key) {
  const rarity = getItem(key)?.rarity ?? 0;
  return rarityColors[Math.max(0, Math.min(rarityColors.length - 1, rarity))];
}

export function getSprite(key) {
  const item = getItem(key);
  if (!item || item.sprite == null) return null;
  const coordinates = catalog.sprites[item.sprite];
  const sheet = catalog.sheets[coordinates[0]];
  return { coordinates, sheet };
}

export function getNamedSprite(icon) {
  const spriteIndex = catalog.namedSprites?.[icon];
  if (spriteIndex == null) return null;
  const coordinates = catalog.sprites[spriteIndex];
  const sheet = catalog.sheets[coordinates[0]];
  return { coordinates, sheet };
}

export function getSourceName(source) {
  return source?.nameRu || source?.name || 'Неизвестный источник';
}

export function getCategoryLabel(category) {
  return categoryLabels[category] || category || 'Разное';
}

export function getStationLabel(station) {
  return stationLabels[station] || station;
}

export function getGroupLabel(group) {
  return groupLabels[group] || group;
}

function normalizeRecipe(recipe, index) {
  const result = getItem(recipe.result);
  return {
    ...recipe,
    id: `game-recipe-${index}`,
    key: recipe.result,
    name: getItemName(recipe.result),
    englishName: result?.name || recipe.result,
    output: recipe.amount,
    category: result?.categories?.[0] || 'miscellaneous',
    categories: result?.categories || [],
    color: getItemColor(recipe.result),
    stage: milestoneStages[result?.milestone] ?? 0,
    station: recipe.stations.map(getStationLabel).join(' / '),
    description: result?.tooltipRu || `Рецепт создания предмета «${getItemName(recipe.result)}». Все ингредиенты и условия указаны ниже.`,
    searchText: normalizeSearch(`${getItemName(recipe.result)} ${result?.name || ''} ${recipe.result} ${recipe.stations.map(getStationLabel).join(' ')} ${recipe.ingredients.map((ingredient) => ingredient.group ? getGroupLabel(ingredient.group) : getItemName(ingredient.item)).join(' ')}`),
    ingredients: recipe.ingredients.map((ingredient) => {
      const group = ingredient.group || null;
      const key = ingredient.item || null;
      const options = group ? catalog.groups[group].items : key ? [key] : [];
      return {
        amount: ingredient.amount,
        group,
        key,
        options,
        iconKey: key || options[0],
        name: group ? getGroupLabel(group) : getItemName(key),
      };
    }),
  };
}

export const allGameRecipes = catalog.recipes.map((recipe, index) => normalizeRecipe(recipe, index));

export const recipesByResult = allGameRecipes.reduce((map, recipe) => {
  if (!map[recipe.result]) map[recipe.result] = [];
  map[recipe.result].push(recipe);
  return map;
}, {});

export const allCraftableItems = Object.keys(recipesByResult).map((key) => recipesByResult[key][0]);

export const obtainLabels = {
  crafted: 'Создаётся', vendor: 'Продаётся у NPC', drop: 'Дроп с противников',
  loot: 'Сундуки и горшки', plunder: 'Собирается в мире', 'shaking-tree': 'Встряхивание деревьев',
  bag: 'Ящики и наборы', 'treasure-bag': 'Мешки боссов', fishing: 'Рыбалка',
  'quest-reward': 'Награда Рыбака', 'strange-plant': 'Обмен странных растений',
  caught: 'Ловля сачком', recorded: 'Запись музыкальной шкатулкой', extractinator: 'Экстрактинатор',
  'extractinator-regular': 'Экстрактинатор', 'chlorophyte-extractinator': 'Хлорофитовый экстрактинатор',
  shimmer: 'Преобразование в Мерцании', 'player-death': 'После смерти персонажа',
  toilet: 'Особый способ', other: 'Другой способ', unobtainable: 'Недоступно в обычной игре',
};

export const biomeLabels = {
  'forest-surface': 'Лес и поверхность', underground: 'Подземелье и пещеры', desert: 'Пустыня',
  snow: 'Снежный биом', jungle: 'Джунгли', 'jungle-temple': 'Храм джунглей', corruption: 'Искажение',
  crimson: 'Багрянец', hallow: 'Освящение', ocean: 'Океан', dungeon: 'Данж', underworld: 'Ад',
  space: 'Космос', 'glowing-mushroom': 'Светящийся грибной биом',
  'granite-marble': 'Гранитные и мраморные пещеры', 'spider-nest': 'Паучье гнездо',
  graveyard: 'Кладбище', meteorite: 'Метеорит',
};

export const eventLabels = {
  'goblin-army': 'Армия гоблинов', 'pirate-invasion': 'Пиратское вторжение',
  'frost-legion': 'Легион мороза', 'martian-madness': 'Марсианское безумие',
  'old-ones-army': 'Армия Древних', 'blood-moon': 'Кровавая луна', 'solar-eclipse': 'Солнечное затмение',
  'pumpkin-moon': 'Тыквенная луна', 'frost-moon': 'Морозная луна', 'lunar-events': 'Лунные события',
  rain: 'Дождь', 'windy-day': 'Ветреный день', sandstorm: 'Песчаная буря', blizzard: 'Метель',
  party: 'Вечеринка', 'lantern-night': 'Ночь фонариков', halloween: 'Хэллоуин', christmas: 'Рождество',
};

export const conditionLabels = {
  day: 'Днём', night: 'Ночью', hardmode: 'В хардмоде', 'after-any-mech': 'После любого механического босса',
  'after-all-mechs': 'После всех механических боссов', 'after-plantera': 'После Плантеры',
  'after-golem': 'После Голема', 'after-martian-madness': 'После Марсианского безумия',
  'after-frost-legion': 'После Легиона мороза', 'after-clown': 'После победы над Клоуном',
  'moon-1': 'Полнолуние', 'moon-2': 'Убывающая луна', 'moon-3': 'Третья четверть',
  'moon-4': 'Убывающий серп', 'moon-5': 'Новолуние', 'moon-6': 'Растущий серп',
  'moon-7': 'Первая четверть', 'moon-8': 'Растущая луна', windy: 'Ветер от 20 миль/ч',
  'bestiary-10': 'Бестиарий заполнен на 10%', 'bestiary-15': 'Бестиарий заполнен на 15%',
  'bestiary-20': 'Бестиарий заполнен на 20%', 'bestiary-25': 'Бестиарий заполнен на 25%',
  'bestiary-30': 'Бестиарий заполнен на 30%', 'bestiary-40': 'Бестиарий заполнен на 40%',
  'bestiary-50': 'Бестиарий заполнен на 50%', 'bestiary-60': 'Бестиарий заполнен на 60%',
  'bestiary-70': 'Бестиарий заполнен на 70%', 'bestiary-80': 'Бестиарий заполнен на 80%',
  'bestiary-90': 'Бестиарий заполнен на 90%', 'bestiary-100': 'Бестиарий заполнен на 100%',
};

export const allItemKeys = Object.keys(gameItems).sort((a, b) => getItemName(a).localeCompare(getItemName(b), 'ru'));
const itemSearchCache = new Map();
export function getItemSearchText(key) {
  if (itemSearchCache.has(key)) return itemSearchCache.get(key);
  const item = getItem(key);
  if (!item) return normalizeSearch(key);
  const sourceNames = (catalog.drops[key] || []).map((drop) => getSourceName(catalog.sources[drop.source]));
  const vendorNames = (catalog.shops[key] || []).map((shop) => getSourceName(catalog.vendors[shop.vendor]));
  const text = normalizeSearch([
    getItemName(key), item.name, key, ...(item.categories || []).map(getCategoryLabel),
    ...(item.obtain || []).map((id) => obtainLabels[id] || id),
    ...(item.biomes || []).map((id) => biomeLabels[id] || id),
    ...(item.events || []).map((id) => eventLabels[id] || id), ...sourceNames, ...vendorNames,
  ].join(' '));
  itemSearchCache.set(key, text);
  return text;
}

export function getItemStage(key) {
  return milestoneStages[getItem(key)?.milestone] ?? 0;
}

export function isItemVisible(key, currentStageIndex, spoilerFree) {
  return !spoilerFree || getItemStage(key) <= currentStageIndex;
}

export const townNpcs = catalog.npcs || [];
export const otherTownNpcs = catalog.otherNpcs || [];
export const npcById = Object.fromEntries([...townNpcs, ...otherTownNpcs].map((npc) => [npc.id, npc]));
export function getNpcName(id) {
  const npc = npcById[id];
  return npc?.nameRu || npc?.name || id;
}

export const defaultResourceKeys = ['Wood', 'StoneBlock', 'Gel', 'Torch', 'IronBar', 'Lens', 'FallenStar', 'Cobweb', 'SandBlock', 'Glass', 'Silk', 'HellstoneBar'];

const resourceInitial = { Wood: 18, StoneBlock: 12, Gel: 8, Torch: 2, IronBar: 8, Lens: 4, FallenStar: 2 };
export const createInitialInventory = () => Object.fromEntries(defaultResourceKeys.map((key) => [key, resourceInitial[key] || 0]));
export const createEmptyInventory = () => ({});

const inventoryAliases = {
  wood: 'Wood', stone: 'StoneBlock', gel: 'Gel', torch: 'Torch', ironBar: 'IronBar', lens: 'Lens',
  fallenStar: 'FallenStar', cobweb: 'Cobweb', sand: 'SandBlock', glass: 'Glass', silk: 'Silk', hellstoneBar: 'HellstoneBar',
};

export function migrateInventory(inventory) {
  let changed = false;
  const next = { ...inventory };
  Object.entries(inventoryAliases).forEach(([oldKey, newKey]) => {
    if (Object.hasOwn(next, oldKey)) {
      next[newKey] = Math.max(next[newKey] || 0, next[oldKey] || 0);
      delete next[oldKey];
      changed = true;
    }
  });
  return changed ? next : inventory;
}

export const allIngredientKeys = (() => {
  const keys = new Set(defaultResourceKeys);
  allGameRecipes.forEach((recipe) => recipe.ingredients.forEach((ingredient) => ingredient.options.forEach((key) => keys.add(key))));
  return [...keys].filter((key) => getItem(key)).sort((a, b) => getItemName(a).localeCompare(getItemName(b), 'ru'));
})();

export function getIngredientCount(inventory, ingredient) {
  if (ingredient.group) return Math.max(0, ...ingredient.options.map((key) => inventory[key] || 0));
  return inventory[ingredient.key] || 0;
}

export function getRecipeStatus(recipe, inventory) {
  const missing = recipe.ingredients.reduce((sum, ingredient) => sum + Math.max(0, ingredient.amount - getIngredientCount(inventory, ingredient)), 0);
  const hasSomething = recipe.ingredients.some((ingredient) => getIngredientCount(inventory, ingredient) > 0);
  return { ready: missing === 0, missing, hasSomething };
}

export function isRecipeVisible(recipe, currentStageIndex, spoilerFree) {
  return !spoilerFree || recipe.stage <= currentStageIndex;
}

export function getCraftableRecipes(inventory, currentStageIndex = 10, spoilerFree = false) {
  return allGameRecipes.filter((recipe) => isRecipeVisible(recipe, currentStageIndex, spoilerFree) && getRecipeStatus(recipe, inventory).ready);
}

export function getRecipesForItem(key) {
  return recipesByResult[key] || [];
}

export function getRecipeById(id) {
  return allGameRecipes.find((recipe) => recipe.id === id);
}
