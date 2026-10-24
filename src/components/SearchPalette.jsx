import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, FileText, Map, Search, Sparkles } from 'lucide-react';
import { useGame } from '../context';
import { guideStories, obtainItems, recipes, stages } from '../data';
import { EmptyState, ItemIcon, Modal } from './UI';

export default function SearchPalette() {
  const {
    setSearchOpen, setModal, navigate, currentStageIndex, spoilerFree, journal,
  } = useGame();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { window.setTimeout(() => inputRef.current?.focus(), 50); }, []);

  const entries = useMemo(() => {
    const craftEntries = recipes
      .filter((item) => !spoilerFree || item.stage <= currentStageIndex)
      .map((item) => ({ id: item.id, title: item.name, subtitle: `Рецепт · ${item.category}`, icon: item.icon, color: item.color, keywords: item.station, action: () => setModal({ type: 'recipe', item }) }));
    const obtainEntries = obtainItems
      .filter((item) => !spoilerFree || item.stage <= currentStageIndex)
      .map((item) => ({ id: item.id, title: item.name, subtitle: `Как получить · ${item.biome}`, icon: item.icon, color: item.color, keywords: item.source, action: () => setModal({ type: 'obtain', item }) }));
    const stageEntries = stages
      .filter((_, index) => index <= currentStageIndex)
      .map((item) => ({ id: item.id, title: item.title, subtitle: `Путь мира · Глава ${item.roman}`, icon: item.icon, color: item.color, keywords: item.boss, action: () => navigate('path') }));
    const storyEntries = guideStories
      .filter((item) => item.stage <= currentStageIndex)
      .map((item) => ({ id: item.id, title: item.title, subtitle: 'История Гида', icon: 'book', color: '#c4a7ff', keywords: item.quote, action: () => navigate('stories') }));
    const journalEntries = journal.map((item) => ({ id: item.id, title: item.title, subtitle: `Дневник · День ${item.day}`, icon: 'journal', color: '#e3c494', keywords: item.text, action: () => navigate('journal') }));
    return [...craftEntries, ...obtainEntries, ...stageEntries, ...storyEntries, ...journalEntries];
  }, [currentStageIndex, journal, navigate, setModal, spoilerFree]);

  const normalized = query.trim().toLowerCase();
  const results = entries.filter((entry) => !normalized || `${entry.title} ${entry.subtitle} ${entry.keywords}`.toLowerCase().includes(normalized)).slice(0, 9);
  const close = () => setSearchOpen(false);
  const choose = (entry) => { setSearchOpen(false); entry.action(); };

  return (
    <Modal onClose={close} label="Поиск по летописи" className="search-modal">
      <div className="search-palette__input"><Search size={22} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Предмет, босс, история…" /><kbd>ESC</kbd></div>
      <div className="search-palette__caption"><span>{normalized ? `Результаты поиска · ${results.length}` : 'Быстрый путь к нужной странице'}</span><span><Sparkles size={13} /> По твоему прогрессу</span></div>
      <div className="search-palette__results">
        {results.map((entry) => (
          <button key={`${entry.subtitle}-${entry.id}`} onClick={() => choose(entry)}>
            <ItemIcon icon={entry.icon} color={entry.color} />
            <span><strong>{entry.title}</strong><small>{entry.subtitle}</small></span>
            <ArrowRight size={16} />
          </button>
        ))}
        {results.length === 0 && <EmptyState icon="compass" title="Ничего не найдено" text="Попробуй более короткий запрос или другое название." />}
      </div>
      <div className="search-palette__footer"><span><Map size={13} /> Путь мира</span><span><BookOpen size={13} /> Истории</span><span><FileText size={13} /> Дневник</span><kbd>CTRL K</kbd></div>
    </Modal>
  );
}
