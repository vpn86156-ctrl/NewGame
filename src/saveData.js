import { stages } from './data';
import { gameCatalog } from './gameData';

export const SAVE_FORMAT = 'terra-chronicle-save';

export function createSave({ progress, spoilerFree, inventory, journal, favorites, challengeAccepted }) {
  return {
    format: SAVE_FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    gameVersion: gameCatalog.meta.gameVersion,
    data: { progress, spoilerFree, inventory, journal, favorites, challengeAccepted },
  };
}

function cleanText(value, maximum, fallback = '') {
  return typeof value === 'string' ? value.slice(0, maximum) : fallback;
}

/** Parse and validate a backup before the user confirms restoring it. */
export function parseSave(input) {
  const save = typeof input === 'string' ? JSON.parse(input) : input;
  if (!save || save.format !== SAVE_FORMAT || save.version !== 1 || !save.data) {
    throw new Error('Это не файл сохранения TERRA Летописи.');
  }
  const data = save.data;
  if (!data.inventory || typeof data.inventory !== 'object' || Array.isArray(data.inventory)
    || !Array.isArray(data.progress) || !Array.isArray(data.journal) || !Array.isArray(data.favorites)) {
    throw new Error('В файле отсутствуют необходимые данные сохранения.');
  }
  const stageIds = new Set(stages.map((stage) => stage.id));
  const progress = stages.map((stage) => stage.id).filter((id) => stageIds.has(id) && data.progress.includes(id));
  const inventory = {};
  Object.entries(data.inventory).slice(0, gameCatalog.meta.itemCount).forEach(([key, amount]) => {
    const numeric = Number(amount);
    if (gameCatalog.items[key] && Number.isFinite(numeric)) inventory[key] = Math.max(0, Math.min(9999, Math.floor(numeric)));
  });
  const journal = data.journal.filter((entry) => entry && typeof entry === 'object').slice(0, 1000).map((entry, index) => ({
    id: cleanText(entry.id, 100, `imported-${index}`),
    day: Math.max(1, Math.min(99999, Number(entry.day) || 1)),
    date: cleanText(entry.date, 60, 'Импортировано'),
    title: cleanText(entry.title, 70, 'Запись без названия'),
    tag: cleanText(entry.tag, 30, 'Приключение'),
    text: cleanText(entry.text, 5000),
    favorite: Boolean(entry.favorite),
  }));
  const favorites = [...new Set(data.favorites.filter((id) => typeof id === 'string').map((id) => id.slice(0, 120)))].slice(0, 10000);
  return {
    progress,
    spoilerFree: data.spoilerFree !== false,
    inventory,
    journal,
    favorites,
    challengeAccepted: Boolean(data.challengeAccepted),
  };
}
