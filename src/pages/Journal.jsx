import { useMemo, useState } from 'react';
import {
  ArrowRight, BookMarked, CalendarDays, Feather, Heart, Plus, Search,
  Sparkles, Trash2,
} from 'lucide-react';
import { useGame } from '../context';
import { EmptyState, PageHeader, Reveal } from '../components/UI';

export default function Journal() {
  const { journal, setModal, toggleJournalFavorite } = useGame();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Все записи');
  const tags = ['Все записи', 'Избранное', ...new Set(journal.map((entry) => entry.tag))];
  const visible = useMemo(() => journal.filter((entry) => {
    if (filter === 'Избранное' && !entry.favorite) return false;
    if (filter !== 'Все записи' && filter !== 'Избранное' && entry.tag !== filter) return false;
    return `${entry.title} ${entry.text} ${entry.tag}`.toLowerCase().includes(query.toLowerCase());
  }), [filter, journal, query]);
  const favoriteCount = journal.filter((entry) => entry.favorite).length;
  const maxDay = journal.reduce((max, entry) => Math.max(max, Number(entry.day) || 0), 0);

  return (
    <div className="journal-page page-stack">
      <PageHeader
        eyebrow="ТВОЯ ЛИЧНАЯ ЛЕТОПИСЬ"
        title="Победы заканчиваются. Истории остаются."
        description="Записывай находки, странные ночи и планы. Этот дневник принадлежит только твоему приключению."
      >
        <button className="button button--primary" onClick={() => setModal({ type: 'journal-new' })}><Plus size={18} /> Новая страница</button>
      </PageHeader>

      <Reveal className="journal-stats" delay={0.05}>
        <div><BookMarked size={20} /><span><strong>{journal.length}</strong> страниц в летописи</span></div>
        <i />
        <div><CalendarDays size={20} /><span><strong>{maxDay || '—'}</strong> дней в мире</span></div>
        <i />
        <div><Heart size={20} /><span><strong>{favoriteCount}</strong> особенных моментов</span></div>
        <span className="journal-stats__quote">«Пусть даже маленькая победа останется на бумаге»</span>
      </Reveal>

      <Reveal className="journal-toolbar" delay={0.08}>
        <div className="filter-chips">
          {tags.map((tag) => <button key={tag} className={filter === tag ? 'is-active' : ''} onClick={() => setFilter(tag)}>{tag === 'Избранное' && <Heart size={13} />}{tag}</button>)}
        </div>
        <label className="field-with-icon field-with-icon--compact"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти в дневнике…" /></label>
      </Reveal>

      {visible.length > 0 ? (
        <div className="journal-grid">
          {visible.map((entry, index) => (
            <Reveal key={entry.id} className={`journal-entry ${index === 0 && filter === 'Все записи' && !query ? 'journal-entry--featured' : ''}`} delay={Math.min(index * 0.07, 0.3)}>
              <div className="journal-entry__binding" aria-hidden="true"><span /><span /><span /></div>
              <div className="journal-entry__top">
                <div className="journal-entry__date"><strong>ДЕНЬ {String(entry.day).padStart(2, '0')}</strong><span>{entry.date}</span></div>
                <button className={`favorite-button ${entry.favorite ? 'is-favorite' : ''}`} onClick={() => toggleJournalFavorite(entry.id)} aria-label={entry.favorite ? 'Убрать из особенных' : 'Отметить как особенное'}><Heart size={18} fill={entry.favorite ? 'currentColor' : 'none'} /></button>
              </div>
              <span className="journal-entry__tag"><Feather size={12} /> {entry.tag}</span>
              <h2>{entry.title}</h2>
              <p>{entry.text}</p>
              <div className="journal-entry__footer">
                <span><Sparkles size={14} /> Записано в Зелёной долине</span>
                <button className="icon-button icon-button--danger" onClick={() => setModal({ type: 'delete-entry', entry })} aria-label="Удалить страницу" title="Удалить страницу"><Trash2 size={16} /></button>
              </div>
            </Reveal>
          ))}
          <Reveal className="journal-add-card" delay={0.15}>
            <button onClick={() => setModal({ type: 'journal-new' })}><span><Plus size={26} /></span><h3>Что произошло сегодня?</h3><p>Добавь новую страницу в свою историю.</p><strong>Написать <ArrowRight size={16} /></strong></button>
          </Reveal>
        </div>
      ) : (
        <EmptyState
          icon="journal" title={journal.length ? 'Таких страниц не найдено' : 'Летопись ждёт первой строки'}
          text={journal.length ? 'Измени запрос или выбери другой фильтр.' : 'Расскажи о первом доме, находке или победе — маленькая запись станет началом большой истории.'}
          action={journal.length ? <button className="button button--soft" onClick={() => { setQuery(''); setFilter('Все записи'); }}>Сбросить фильтры</button> : <button className="button button--primary" onClick={() => setModal({ type: 'journal-new' })}><Plus size={17} /> Создать страницу</button>}
        />
      )}
    </div>
  );
}
