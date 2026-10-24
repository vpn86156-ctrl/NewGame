import { useMemo, useState } from 'react';
import {
  ArrowUpRight, BookOpen, Check, ChevronRight, Compass, EyeOff, Heart,
  MapPin, PackageSearch, Search, Sparkles, Star,
} from 'lucide-react';
import { useGame } from '../context';
import { obtainItems, recipes, resourceById } from '../data';
import { EmptyState, ItemIcon, PageHeader, Reveal } from '../components/UI';

function SearchToolbar({ query, setQuery, placeholder, children }) {
  return (
    <Reveal className="library-toolbar" delay={0.05}>
      <label className="library-search"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') { setQuery(''); event.currentTarget.blur(); } }} placeholder={placeholder} /><kbd>ESC</kbd></label>
      <div className="filter-chips">{children}</div>
    </Reveal>
  );
}

export function Crafts() {
  const { currentStageIndex, spoilerFree, setModal, favorites, toggleFavorite } = useGame();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Все');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const categories = ['Все', ...new Set(recipes.filter((recipe) => !spoilerFree || recipe.stage <= currentStageIndex).map((recipe) => recipe.category))];
  const visible = useMemo(() => recipes.filter((recipe) => {
    if (spoilerFree && recipe.stage > currentStageIndex) return false;
    if (category !== 'Все' && recipe.category !== category) return false;
    if (onlyFavorites && !favorites.includes(recipe.id)) return false;
    const haystack = `${recipe.name} ${recipe.category} ${recipe.station}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  }), [category, currentStageIndex, favorites, onlyFavorites, query, spoilerFree]);
  const hiddenCount = spoilerFree ? recipes.filter((recipe) => recipe.stage > currentStageIndex).length : 0;

  return (
    <div className="library-page page-stack">
      <PageHeader
        eyebrow="БИБЛИОТЕКА МАСТЕРА"
        title="Все крафты. Без хаоса."
        description="От первого верстака до снаряжения финальной главы. Нажми на карточку, чтобы увидеть полный рецепт."
      >
        <div className="library-count"><strong>{visible.length}</strong><span>рецептов<br />в подборке</span></div>
      </PageHeader>
      <SearchToolbar query={query} setQuery={setQuery} placeholder="Название, категория или станция…">
        {categories.map((item) => <button key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
        <button className={`filter-favorite ${onlyFavorites ? 'is-active' : ''}`} onClick={() => setOnlyFavorites(!onlyFavorites)}><Heart size={14} fill={onlyFavorites ? 'currentColor' : 'none'} /> Избранное</button>
      </SearchToolbar>
      {hiddenCount > 0 && <Reveal className="library-spoiler-line"><EyeOff size={15} /><span>{hiddenCount} поздних рецептов скрыто режимом без спойлеров.</span></Reveal>}
      {visible.length > 0 ? (
        <div className="craft-grid">
          {visible.map((recipe, index) => {
            const favorite = favorites.includes(recipe.id);
            return (
              <Reveal key={recipe.id} delay={Math.min(index * 0.045, 0.3)} className="craft-card-wrap">
                <article className="craft-card" style={{ '--item-accent': recipe.color }}>
                  <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(recipe.id)} aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button>
                  <button className="craft-card__main" onClick={() => setModal({ type: 'recipe', item: recipe })}>
                    <div className="craft-card__visual"><span className="craft-card__grid" /><ItemIcon icon={recipe.icon} color={recipe.color} size="xl" /><span className="craft-card__category">{recipe.category}</span></div>
                    <div className="craft-card__body">
                      <h3>{recipe.name}{recipe.output > 1 && <small>×{recipe.output}</small>}</h3>
                      <div className="craft-card__ingredients">
                        {Object.entries(recipe.ingredients).map(([id, amount]) => <span key={id}><i style={{ background: resourceById[id]?.color }} />{resourceById[id]?.short}<b>{amount}</b></span>)}
                      </div>
                      <div className="craft-card__footer"><span>{recipe.station}</span><span className="round-arrow"><ArrowUpRight size={16} /></span></div>
                    </div>
                  </button>
                </article>
              </Reveal>
            );
          })}
        </div>
      ) : <EmptyState icon="workbench" title="Рецепты не найдены" text="Попробуй другой запрос или сбрось фильтры." action={<button className="button button--soft" onClick={() => { setQuery(''); setCategory('Все'); setOnlyFavorites(false); }}>Сбросить фильтры</button>} />}
    </div>
  );
}

export function Obtain() {
  const { currentStageIndex, spoilerFree, setModal, favorites, toggleFavorite } = useGame();
  const [query, setQuery] = useState('');
  const [biome, setBiome] = useState('Все места');
  const availableItems = obtainItems.filter((item) => !spoilerFree || item.stage <= currentStageIndex);
  const biomes = ['Все места', ...new Set(availableItems.map((item) => item.biome))];
  const visible = availableItems.filter((item) => {
    if (biome !== 'Все места' && item.biome !== biome) return false;
    return `${item.name} ${item.source} ${item.category}`.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="obtain-page page-stack">
      <PageHeader
        eyebrow="КАРТА СОКРОВИЩ"
        title="Не создать. Найти."
        description="Точные места, маршруты поиска и небольшие подсказки для предметов, которые нельзя просто собрать на верстаке."
      >
        <div className="obtain-header-emblem"><Compass size={30} /><span><strong>{visible.length}</strong> находок рядом<br />с твоим этапом</span></div>
      </PageHeader>
      <SearchToolbar query={query} setQuery={setQuery} placeholder="Что ты хочешь найти?">
        {biomes.map((item) => <button key={item} className={biome === item ? 'is-active' : ''} onClick={() => setBiome(item)}>{item !== 'Все места' && <MapPin size={12} />}{item}</button>)}
      </SearchToolbar>
      {spoilerFree && <Reveal className="library-spoiler-line"><EyeOff size={15} /><span>В списке только находки для уже открытых глав.</span></Reveal>}
      <div className="obtain-grid">
        {visible.map((item, index) => {
          const favorite = favorites.includes(item.id);
          return (
            <Reveal key={item.id} delay={Math.min(index * 0.06, 0.3)}>
              <article className="obtain-card" style={{ '--item-accent': item.color }}>
                <div className="obtain-card__top">
                  <ItemIcon icon={item.icon} color={item.color} size="lg" />
                  <span className="obtain-card__category">{item.category}</span>
                  <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(item.id)} aria-label="Избранное"><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /></button>
                </div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="obtain-card__source"><MapPin size={15} /><div><small>ГДЕ ИСКАТЬ</small><strong>{item.source}</strong></div></div>
                <div className="obtain-card__footer"><span>{item.biome}</span><span>{item.chance}</span></div>
                <button className="button button--soft button--full" onClick={() => setModal({ type: 'obtain', item })}>Показать маршрут <ChevronRight size={16} /></button>
              </article>
            </Reveal>
          );
        })}
      </div>
      {visible.length === 0 && <EmptyState icon="compass" title="Сокровище спряталось слишком хорошо" text="Попробуй другой запрос или выбери все места." action={<button className="button button--soft" onClick={() => { setQuery(''); setBiome('Все места'); }}>Сбросить поиск</button>} />}
    </div>
  );
}
