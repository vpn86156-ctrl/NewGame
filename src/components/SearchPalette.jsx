import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, FileText, Map, Search, Sparkles } from 'lucide-react';
import { useGame } from '../context';
import { guideStories, stages } from '../data';
import {
  allItemKeys, getCategoryLabel, getItem, getItemColor, getItemName, getItemSearchText, getSearchScore,
  getRecipesForItem, isItemVisible, normalizeSearch, obtainLabels, townNpcs, otherTownNpcs, getNpcName,
} from '../gameData';
import { EmptyState, ItemIcon, Modal } from './UI';
import TerrariaIcon, { NamedSprite } from './TerrariaIcon';
import StageIcon from './StageIcon';

const popular = new Set(['WorkBench', 'WoodenSword', 'IronPickaxe', 'MoltenPickaxe', 'Zenith', 'Aglet', 'HermesBoots']);

export default function SearchPalette() {
  const { setSearchOpen, setModal, navigate, currentStageIndex, spoilerFree, journal } = useGame();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { window.setTimeout(() => inputRef.current?.focus(), 50); }, []);

  const entries = useMemo(() => {
    const itemEntries = allItemKeys
      .filter((key) => isItemVisible(key, currentStageIndex, spoilerFree))
      .map((key) => {
        const item = getItem(key);
        const recipe = getRecipesForItem(key)[0];
        const methods = (item.obtain || []).slice(0, 2).map((id) => obtainLabels[id] || id).join(' · ');
        return {
          id: key, kind: recipe ? 'recipe' : 'item', itemKey: key, popular: popular.has(key),
          title: getItemName(key), subtitle: recipe ? `Рецепт · ${getCategoryLabel(recipe.category)}` : `Предмет · ${methods || getCategoryLabel(item.categories?.[0])}`,
          color: getItemColor(key), keywords: getItemSearchText(key),
          action: () => recipe ? setModal({ type: 'recipe', item: recipe }) : setModal({ type: 'item', itemKey: key }),
        };
      });
    const npcEntries = townNpcs.map((npc) => ({
      id: npc.id, kind: 'npc', npcIcon: npc.icon, popular: npc.id === 'guide',
      title: getNpcName(npc.id), subtitle: `Все NPC · ${npc.role}`, color: '#c4a7ff',
      keywords: `${npc.name} ${npc.role} ${Object.values(npc.neighbors).flat().map(getNpcName).join(' ')}`,
      action: () => { navigate('npcs'); window.setTimeout(() => document.getElementById(`npc-${npc.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300); },
    }));
    const otherNpcEntries = otherTownNpcs.map((npc) => ({
      id: npc.id, kind: 'npc', npcIcon: npc.icon, popular: false,
      title: npc.nameRu, subtitle: `Гости и питомцы · ${npc.role}`, color: '#70e4c1',
      keywords: `${npc.name} ${npc.role}`, action: () => navigate('npcs'),
    }));
    const stageEntries = stages
      .filter((_, index) => index <= currentStageIndex)
      .map((item) => ({ id: item.id, kind: 'stage', stageId: item.id, popular: true, title: item.title, subtitle: `Путь мира · Глава ${item.roman}`, color: item.color, keywords: item.boss, action: () => navigate('path') }));
    const storyEntries = guideStories
      .filter((item) => item.stage <= currentStageIndex)
      .map((item) => ({ id: item.id, kind: 'interface', icon: 'book', popular: true, title: item.title, subtitle: 'История Гида', color: '#c4a7ff', keywords: item.quote, action: () => navigate('stories') }));
    const journalEntries = journal.map((item) => ({ id: item.id, kind: 'interface', icon: 'journal', popular: true, title: item.title, subtitle: `Дневник · День ${item.day}`, color: '#e3c494', keywords: item.text, action: () => navigate('journal') }));
    return [...itemEntries, ...npcEntries, ...otherNpcEntries, ...stageEntries, ...storyEntries, ...journalEntries];
  }, [currentStageIndex, journal, navigate, setModal, spoilerFree]);

  const normalized = normalizeSearch(query);
  const results = entries.map((entry) => ({
    entry,
    score: normalized ? getSearchScore(`${entry.title} ${entry.subtitle} ${entry.keywords || ''}`, query, entry.title) : (entry.popular ? 0 : Infinity),
  })).filter(({ score }) => score !== Infinity)
    .sort((a, b) => a.score - b.score || Number(b.entry.popular) - Number(a.entry.popular) || a.entry.title.localeCompare(b.entry.title, 'ru'))
    .slice(0, 10).map(({ entry }) => entry);
  const close = () => setSearchOpen(false);
  const choose = (entry) => { setSearchOpen(false); entry.action(); };

  return (
    <Modal onClose={close} label="Поиск по летописи" className="search-modal">
      <div className="search-palette__input"><Search size={22} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Зенит, любой предмет, босс или история…" /><kbd>ESC</kbd></div>
      <div className="search-palette__caption"><span>{normalized ? `Результаты поиска · показано ${results.length}` : 'Быстрый путь к нужной странице'}</span><span><Sparkles size={13} /> {allItemKeys.length.toLocaleString('ru-RU')} предметов · опечатки, синонимы и транслитерация</span></div>
      <div className="search-palette__results">
        {results.map((entry) => (
          <button key={`${entry.kind}-${entry.id}`} onClick={() => choose(entry)}>
            {entry.kind === 'recipe' || entry.kind === 'item' ? <TerrariaIcon itemKey={entry.itemKey} /> : entry.kind === 'npc' ? <span className="search-npc-icon"><NamedSprite icon={entry.npcIcon} label={entry.title} size={39} /></span> : entry.kind === 'stage' ? <StageIcon stageId={entry.stageId} color={entry.color} /> : <ItemIcon icon={entry.icon} color={entry.color} />}
            <span><strong>{entry.title}</strong><small>{entry.subtitle}</small></span>
            <ArrowRight size={16} />
          </button>
        ))}
        {results.length === 0 && <EmptyState icon="compass" title="Ничего не найдено" text="Попробуй короче, с одной опечаткой, латиницей или обычным русским названием — например «меч в камне»." />}
      </div>
      <div className="search-palette__footer"><span><Map size={13} /> Путь мира</span><span><BookOpen size={13} /> Истории</span><span><FileText size={13} /> Дневник</span><kbd>CTRL K</kbd></div>
    </Modal>
  );
}
