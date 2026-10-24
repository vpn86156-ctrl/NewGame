import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, FileText, Map, Search, Sparkles } from 'lucide-react';
import { useGame } from '../context';
import { guideStories, obtainItems, stages } from '../data';
import { allGameRecipes, getCategoryLabel, obtainItemKeys } from '../gameData';
import { EmptyState, ItemIcon, Modal } from './UI';
import TerrariaIcon from './TerrariaIcon';
import StageIcon from './StageIcon';

const popular = new Set(['WorkBench', 'WoodenSword', 'IronPickaxe', 'MoltenPickaxe']);

export default function SearchPalette() {
  const { setSearchOpen, setModal, navigate, currentStageIndex, spoilerFree, journal } = useGame();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { window.setTimeout(() => inputRef.current?.focus(), 50); }, []);

  const entries = useMemo(() => {
    const craftEntries = allGameRecipes
      .filter((item) => !spoilerFree || item.stage <= currentStageIndex)
      .map((item) => ({ id: item.id, kind: 'recipe', itemKey: item.result, popular: popular.has(item.result), title: item.name, subtitle: `Рецепт · ${getCategoryLabel(item.category)}`, color: item.color, keywords: item.searchText, action: () => setModal({ type: 'recipe', item }) }));
    const obtainEntries = obtainItems
      .filter((item) => !spoilerFree || item.stage <= currentStageIndex)
      .map((item) => ({ id: item.id, kind: 'obtain', itemKey: obtainItemKeys[item.id], popular: true, title: item.name, subtitle: `Как получить · ${item.biome}`, color: item.color, keywords: item.source, action: () => setModal({ type: 'obtain', item }) }));
    const stageEntries = stages
      .filter((_, index) => index <= currentStageIndex)
      .map((item) => ({ id: item.id, kind: 'stage', stageId: item.id, popular: true, title: item.title, subtitle: `Путь мира · Глава ${item.roman}`, color: item.color, keywords: item.boss, action: () => navigate('path') }));
    const storyEntries = guideStories
      .filter((item) => item.stage <= currentStageIndex)
      .map((item) => ({ id: item.id, kind: 'interface', icon: 'book', popular: true, title: item.title, subtitle: 'История Гида', color: '#c4a7ff', keywords: item.quote, action: () => navigate('stories') }));
    const journalEntries = journal.map((item) => ({ id: item.id, kind: 'interface', icon: 'journal', popular: true, title: item.title, subtitle: `Дневник · День ${item.day}`, color: '#e3c494', keywords: item.text, action: () => navigate('journal') }));
    return [...craftEntries, ...obtainEntries, ...stageEntries, ...storyEntries, ...journalEntries];
  }, [currentStageIndex, journal, navigate, setModal, spoilerFree]);

  const normalized = query.trim().toLowerCase();
  const results = entries.filter((entry) => normalized ? `${entry.title} ${entry.subtitle} ${entry.keywords}`.toLowerCase().includes(normalized) : entry.popular).slice(0, 9);
  const close = () => setSearchOpen(false);
  const choose = (entry) => { setSearchOpen(false); entry.action(); };

  return (
    <Modal onClose={close} label="Поиск по летописи" className="search-modal">
      <div className="search-palette__input"><Search size={22} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Любой предмет, босс, история…" /><kbd>ESC</kbd></div>
      <div className="search-palette__caption"><span>{normalized ? `Результаты поиска · показано ${results.length}` : 'Быстрый путь к нужной странице'}</span><span><Sparkles size={13} /> Полная база · по твоему прогрессу</span></div>
      <div className="search-palette__results">
        {results.map((entry) => (
          <button key={`${entry.kind}-${entry.id}`} onClick={() => choose(entry)}>
            {entry.kind === 'recipe' || entry.kind === 'obtain' ? <TerrariaIcon itemKey={entry.itemKey} /> : entry.kind === 'stage' ? <StageIcon stageId={entry.stageId} color={entry.color} /> : <ItemIcon icon={entry.icon} color={entry.color} />}
            <span><strong>{entry.title}</strong><small>{entry.subtitle}</small></span>
            <ArrowRight size={16} />
          </button>
        ))}
        {results.length === 0 && <EmptyState icon="compass" title="Ничего не найдено" text="Попробуй более короткий запрос или английское название предмета." />}
      </div>
      <div className="search-palette__footer"><span><Map size={13} /> Путь мира</span><span><BookOpen size={13} /> Истории</span><span><FileText size={13} /> Дневник</span><kbd>CTRL K</kbd></div>
    </Modal>
  );
}
