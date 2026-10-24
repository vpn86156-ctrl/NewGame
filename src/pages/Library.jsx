import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Compass,
  EyeOff, Heart, MapPin, Search, SlidersHorizontal,
} from 'lucide-react';
import { useGame } from '../context';
import { obtainItems } from '../data';
import {
  allGameRecipes, gameCatalog, getCategoryLabel, getItem, getItemName, getStationLabel,
  obtainItemKeys, recipesByResult,
} from '../gameData';
import { EmptyState, PageHeader, Reveal } from '../components/UI';
import TerrariaIcon, { GameSprite } from '../components/TerrariaIcon';

const PAGE_SIZE = 48;

function SearchToolbar({ query, setQuery, placeholder, children }) {
  return (
    <Reveal className="library-toolbar" delay={0.05}>
      <label className="library-search"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') { setQuery(''); event.currentTarget.blur(); } }} placeholder={placeholder} /><kbd>ESC</kbd></label>
      <div className="filter-chips">{children}</div>
    </Reveal>
  );
}

function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;
  const pages = [...new Set([1, page - 1, page, page + 1, pageCount].filter((value) => value >= 1 && value <= pageCount))].sort((a, b) => a - b);
  return (
    <nav className="pagination" aria-label="Страницы рецептов">
      <button className="icon-button" onClick={() => onChange(1)} disabled={page === 1} aria-label="Первая страница"><ChevronsLeft size={17} /></button>
      <button className="icon-button" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Предыдущая страница"><ChevronLeft size={17} /></button>
      <div className="pagination__pages">
        {pages.map((value, index) => {
          const previous = pages[index - 1];
          return (
            <span key={value} className="pagination__unit">
              {previous && value - previous > 1 && <i>…</i>}
              <button className={page === value ? 'is-active' : ''} onClick={() => onChange(value)} aria-current={page === value ? 'page' : undefined}>{value}</button>
            </span>
          );
        })}
      </div>
      <button className="icon-button" onClick={() => onChange(page + 1)} disabled={page === pageCount} aria-label="Следующая страница"><ChevronRight size={17} /></button>
      <button className="icon-button" onClick={() => onChange(pageCount)} disabled={page === pageCount} aria-label="Последняя страница"><ChevronsRight size={17} /></button>
    </nav>
  );
}

export function Crafts() {
  const { currentStageIndex, spoilerFree, setModal, favorites, toggleFavorite } = useGame();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [station, setStation] = useState('all');
  const [sortBy, setSortBy] = useState('game');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [page, setPage] = useState(1);

  const categories = useMemo(() => [...new Set(allGameRecipes.flatMap((recipe) => recipe.categories))]
    .sort((a, b) => getCategoryLabel(a).localeCompare(getCategoryLabel(b), 'ru')), []);
  const progressRecipes = useMemo(() => allGameRecipes.filter((recipe) => !spoilerFree || recipe.stage <= currentStageIndex), [currentStageIndex, spoilerFree]);
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return progressRecipes.filter((recipe) => {
      if (category !== 'all' && !recipe.categories.includes(category)) return false;
      if (station !== 'all' && !recipe.stations.includes(station)) return false;
      if (onlyFavorites && !favorites.includes(recipe.id)) return false;
      return !normalized || recipe.searchText.includes(normalized);
    }).sort((a, b) => {
      if (sortBy === 'game') return ((getItem(a.result)?.id ?? 99999) - (getItem(b.result)?.id ?? 99999)) || a.name.localeCompare(b.name, 'ru');
      if (sortBy === 'stage') return a.stage - b.stage || a.name.localeCompare(b.name, 'ru');
      if (sortBy === 'rarity') return ((getItem(b.result)?.rarity ?? 0) - (getItem(a.result)?.rarity ?? 0)) || a.name.localeCompare(b.name, 'ru');
      return a.name.localeCompare(b.name, 'ru');
    });
  }, [category, favorites, onlyFavorites, progressRecipes, query, sortBy, station]);

  useEffect(() => { setPage(1); }, [query, category, station, onlyFavorites, sortBy, currentStageIndex, spoilerFree]);
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hiddenCount = allGameRecipes.length - progressRecipes.length;
  const changePage = (nextPage) => {
    setPage(Math.max(1, Math.min(pageCount, nextPage)));
    document.getElementById('craft-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const reset = () => { setQuery(''); setCategory('all'); setStation('all'); setOnlyFavorites(false); };

  return (
    <div className="library-page page-stack full-library">
      <PageHeader
        eyebrow={`ПОЛНАЯ БАЗА · TERRARIA ${gameCatalog.meta.gameVersion}`}
        title="Все крафты. Настоящие иконки."
        description={`${gameCatalog.meta.recipeCount.toLocaleString('ru-RU')} рецептов и ${Object.keys(recipesByResult).length.toLocaleString('ru-RU')} создаваемых предметов. Оригинальные игровые спрайты, все станции и варианты крафта.`}
      >
        <div className="library-count"><strong>{visible.length.toLocaleString('ru-RU')}</strong><span>рецептов<br />в подборке</span></div>
      </PageHeader>

      <SearchToolbar query={query} setQuery={setQuery} placeholder="Название, ингредиент или станция…">
        <button className={category === 'all' ? 'is-active' : ''} onClick={() => setCategory('all')}>Все категории</button>
        {categories.map((item) => <button key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{getCategoryLabel(item)}</button>)}
        <button className={`filter-favorite ${onlyFavorites ? 'is-active' : ''}`} onClick={() => setOnlyFavorites(!onlyFavorites)}><Heart size={14} fill={onlyFavorites ? 'currentColor' : 'none'} /> Избранное</button>
      </SearchToolbar>

      <Reveal className="catalog-controls" delay={0.07}>
        <div className="catalog-controls__selects">
          <label><SlidersHorizontal size={15} /><span>Станция</span><select value={station} onChange={(event) => setStation(event.target.value)}><option value="all">Все станции</option>{gameCatalog.stations.map((name) => <option key={name} value={name}>{getStationLabel(name)}</option>)}</select></label>
          <label><span>Сортировка</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="game">Порядок в игре</option><option value="name">По названию</option><option value="stage">По этапу игры</option><option value="rarity">По редкости</option></select></label>
        </div>
        <div className="catalog-controls__meta"><span className="sprite-proof"><GameSprite itemKey="WorkBench" size={21} /> Оригинальные спрайты</span><span>{visible.length ? `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, visible.length)} из ${visible.length.toLocaleString('ru-RU')}` : '0 рецептов'}</span></div>
      </Reveal>

      {hiddenCount > 0 && <Reveal className="library-spoiler-line"><EyeOff size={15} /><span>{hiddenCount} поздних рецептов скрыто режимом без спойлеров. <button onClick={() => setCategory('all')}>Прогресс: глава {currentStageIndex + 1}</button></span></Reveal>}

      {pageItems.length > 0 ? (
        <>
          <div className="craft-grid" id="craft-grid">
            {pageItems.map((recipe, index) => {
              const favorite = favorites.includes(recipe.id);
              const variants = recipesByResult[recipe.result];
              const variantIndex = variants.findIndex((item) => item.id === recipe.id);
              return (
                <Reveal key={recipe.id} delay={Math.min((index % 8) * 0.035, 0.2)} className="craft-card-wrap">
                  <article className="craft-card" style={{ '--item-accent': recipe.color }}>
                    <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(recipe.id)} aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button>
                    <button className="craft-card__main" onClick={() => setModal({ type: 'recipe', item: recipe })} aria-label={`Открыть рецепт: ${recipe.name}`}>
                      <div className="craft-card__visual"><span className="craft-card__grid" /><TerrariaIcon itemKey={recipe.result} size="xl" /><span className="craft-card__category">{getCategoryLabel(recipe.category)}</span>{variants.length > 1 && <span className="craft-card__variant">Вариант {variantIndex + 1}/{variants.length}</span>}</div>
                      <div className="craft-card__body">
                        <h3 title={recipe.englishName}>{recipe.name}{recipe.output > 1 && <small>×{recipe.output}</small>}</h3>
                        {recipe.name !== recipe.englishName && <span className="craft-card__english">{recipe.englishName}</span>}
                        <div className="craft-card__ingredients">
                          {recipe.ingredients.slice(0, 3).map((ingredient) => <span key={`${ingredient.group || ingredient.key}-${ingredient.amount}`} title={ingredient.name}><GameSprite itemKey={ingredient.iconKey} size={17} /><em>{ingredient.group ? 'Группа' : getItemName(ingredient.key)}</em><b>{ingredient.amount}</b></span>)}
                          {recipe.ingredients.length > 3 && <span className="craft-card__more" title="Все ингредиенты — внутри карточки">+{recipe.ingredients.length - 3}</span>}
                        </div>
                        <div className="craft-card__footer"><span>{recipe.station}</span><span className="round-arrow"><ArrowUpRight size={16} /></span></div>
                      </div>
                    </button>
                  </article>
                </Reveal>
              );
            })}
          </div>
          <div className="catalog-bottom"><span>Страница {safePage} из {pageCount}</span><Pagination page={safePage} pageCount={pageCount} onChange={changePage} /></div>
        </>
      ) : <EmptyState icon="workbench" title="Рецепты не найдены" text="Попробуй другой запрос или сбрось фильтры." action={<button className="button button--soft" onClick={reset}>Сбросить фильтры</button>} />}
      <footer className="catalog-attribution">Данные и оригинальные спрайты: <a href="https://terraria.wiki.gg/" target="_blank" rel="noreferrer">Official Terraria Wiki</a> и <a href="https://github.com/Doeschi/Terraria-Progress-Tracker" target="_blank" rel="noreferrer">Doeschi</a> · <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer">CC BY-NC-SA 4.0</a></footer>
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
      <PageHeader eyebrow="КАРТА СОКРОВИЩ" title="Не создать. Найти." description="Точные места, маршруты поиска и небольшие подсказки для предметов, которые нельзя просто собрать на верстаке.">
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
                <div className="obtain-card__top"><TerrariaIcon itemKey={obtainItemKeys[item.id]} size="lg" /><span className="obtain-card__category">{item.category}</span><button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(item.id)} aria-label="Избранное"><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /></button></div>
                <h3>{item.name}</h3><p>{item.description}</p>
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
