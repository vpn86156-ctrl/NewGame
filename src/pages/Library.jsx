import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Compass,
  EyeOff, Heart, MapPin, Search, SlidersHorizontal,
} from 'lucide-react';
import { useGame } from '../context';
import { stages } from '../data';
import {
  allGameRecipes, allItemKeys, biomeLabels, gameCatalog, getCategoryLabel, getItem, getItemBiomes, getItemColor,
  getItemName, getItemSearchText, getItemStage, getSourceName, getStationLabel, isItemVisible,
  matchesSearch, matchesWeaponClass, obtainLabels, platformLabels, recipesByResult, isRecipeVisible, weaponClassLabels,
} from '../gameData';
import { EmptyState, PageHeader, Reveal } from '../components/UI';
import TerrariaIcon, { GameSprite, NamedSprite, SourceSprite } from '../components/TerrariaIcon';

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
  const { currentStageIndex, spoilerFree, modal, setModal, favorites, toggleFavorite } = useGame();
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
    return progressRecipes.filter((recipe) => {
      if (category !== 'all' && !recipe.categories.includes(category)) return false;
      if (station !== 'all' && !recipe.stations.includes(station)) return false;
      if (onlyFavorites && !favorites.includes(recipe.id)) return false;
      return matchesSearch(recipe.searchText, query);
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
                      <div className="craft-card__visual"><span className="craft-card__grid" /><TerrariaIcon itemKey={recipe.result} size="xl" layoutId={modal ? undefined : `craft-icon-${recipe.id}`} /><span className="craft-card__category">{getCategoryLabel(recipe.category)}</span>{variants.length > 1 && <span className="craft-card__variant">Вариант {variantIndex + 1}/{variants.length}</span>}</div>
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
  const { currentStageIndex, spoilerFree, modal, setModal, favorites, toggleFavorite } = useGame();
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState('all');
  const [category, setCategory] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [biome, setBiome] = useState('all');
  const [weaponClass, setWeaponClass] = useState('all');
  const [version, setVersion] = useState('all');
  const [platform, setPlatform] = useState('all');
  const [page, setPage] = useState(1);
  const availableItems = useMemo(() => allItemKeys.filter((key) => isItemVisible(key, currentStageIndex, spoilerFree)), [currentStageIndex, spoilerFree]);
  const categories = useMemo(() => [...new Set(allItemKeys.flatMap((key) => getItem(key)?.categories || []))]
    .sort((a, b) => getCategoryLabel(a).localeCompare(getCategoryLabel(b), 'ru')), []);
  const methods = useMemo(() => [...new Set(allItemKeys.flatMap((key) => getItem(key)?.obtain || []))]
    .filter((id) => obtainLabels[id])
    .sort((a, b) => obtainLabels[a].localeCompare(obtainLabels[b], 'ru')), []);
  const biomes = useMemo(() => [...new Set(allItemKeys.flatMap(getItemBiomes))].filter((id) => biomeLabels[id]).sort((a, b) => biomeLabels[a].localeCompare(biomeLabels[b], 'ru')), []);
  const versions = useMemo(() => [...new Set(allItemKeys.map((key) => getItem(key)?.version).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), []);
  const platforms = useMemo(() => [...new Set(allItemKeys.flatMap((key) => getItem(key)?.platforms || []))].filter((id) => platformLabels[id]), []);
  const visible = useMemo(() => availableItems.filter((key) => {
    const item = getItem(key);
    if (method !== 'all' && !(item?.obtain || []).includes(method)) return false;
    if (category !== 'all' && !(item?.categories || []).includes(category)) return false;
    if (stageFilter !== 'all' && getItemStage(key) !== Number(stageFilter)) return false;
    if (biome !== 'all' && !getItemBiomes(key).includes(biome)) return false;
    if (!matchesWeaponClass(key, weaponClass)) return false;
    if (version !== 'all' && item?.version !== version) return false;
    if (platform !== 'all' && !(item?.platforms || []).includes(platform)) return false;
    return matchesSearch(getItemSearchText(key), query);
  }), [availableItems, biome, category, method, platform, query, stageFilter, version, weaponClass]);

  useEffect(() => { setPage(1); }, [query, method, category, stageFilter, biome, weaponClass, version, platform, currentStageIndex, spoilerFree]);
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const reset = () => { setQuery(''); setMethod('all'); setCategory('all'); setStageFilter('all'); setBiome('all'); setWeaponClass('all'); setVersion('all'); setPlatform('all'); };
  const changePage = (next) => {
    setPage(Math.max(1, Math.min(pageCount, next)));
    document.getElementById('obtain-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="obtain-page page-stack full-library">
      <PageHeader
        eyebrow={`ПОЛНЫЙ СПРАВОЧНИК · ${allItemKeys.length.toLocaleString('ru-RU')} ПРЕДМЕТОВ`}
        title="Как найти любой предмет."
        description="Крафт, противники, сундуки, магазины, рыбалка и особые способы. Нажми на предмет — внутри источники, настоящие изображения, шансы и условия получения."
      >
        <div className="obtain-header-emblem"><Compass size={30} /><span><strong>{visible.length.toLocaleString('ru-RU')}</strong> предметов<br />в текущей подборке</span></div>
      </PageHeader>
      <SearchToolbar query={query} setQuery={setQuery} placeholder="Зенит, сапоги, Zenith, сундук…">
        <button className={method === 'all' ? 'is-active' : ''} onClick={() => setMethod('all')}>Все способы</button>
        {methods.map((id) => <button key={id} className={method === id ? 'is-active' : ''} onClick={() => setMethod(id)}>{obtainLabels[id]}</button>)}
      </SearchToolbar>
      <Reveal className="catalog-controls" delay={0.07}>
        <div className="catalog-controls__selects">
          <label><SlidersHorizontal size={15} /><span>Категория</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">Все категории</option>{categories.map((id) => <option key={id} value={id}>{getCategoryLabel(id)}</option>)}</select></label>
          <label><span>Этап</span><select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}><option value="all">Любой</option>{stages.map((stage, index) => <option key={stage.id} value={index}>{stage.roman} · {stage.title}</option>)}</select></label>
          <label><span>Биом</span><select value={biome} onChange={(event) => setBiome(event.target.value)}><option value="all">Любой</option>{biomes.map((id) => <option key={id} value={id}>{biomeLabels[id]}</option>)}</select></label>
          <label><span>Класс</span><select value={weaponClass} onChange={(event) => setWeaponClass(event.target.value)}><option value="all">Любой</option>{Object.entries(weaponClassLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          <label><span>Версия</span><select value={version} onChange={(event) => setVersion(event.target.value)}><option value="all">Любая</option>{versions.map((id) => <option key={id} value={id}>{id}</option>)}</select></label>
          <label><span>Платформа</span><select value={platform} onChange={(event) => setPlatform(event.target.value)}><option value="all">Любая</option>{platforms.map((id) => <option key={id} value={id}>{platformLabels[id]}</option>)}</select></label>
        </div>
        <div className="catalog-controls__meta"><span className="sprite-proof"><GameSprite itemKey="Aglet" size={21} /> Все предметы игры</span><span>{visible.length ? `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, visible.length)} из ${visible.length.toLocaleString('ru-RU')}` : '0 предметов'}</span></div>
      </Reveal>
      {spoilerFree && <Reveal className="library-spoiler-line"><EyeOff size={15} /><span>Поздние предметы скрыты режимом без спойлеров. Отключи его, чтобы увидеть весь каталог.</span></Reveal>}
      {pageItems.length > 0 ? <>
        <div className="obtain-grid" id="obtain-grid">
          {pageItems.map((key, index) => {
            const item = getItem(key);
            const favorite = favorites.includes(`item-${key}`);
            const drops = gameCatalog.drops[key] || [];
            const shops = gameCatalog.shops[key] || [];
            const recipes = recipesByResult[key] || [];
            const firstSource = drops[0] ? gameCatalog.sources[drops[0].source] : null;
            const firstVendor = shops[0] ? gameCatalog.vendors[shops[0].vendor] : null;
            const firstMethod = (item.obtain || []).find((id) => id !== 'crafted' && id !== 'vendor' && id !== 'drop');
            const methodIcon = gameCatalog.obtainMethods.find((entry) => entry.id === firstMethod)?.icon?.split('/').pop();
            const sourceTitle = firstSource ? getSourceName(firstSource) : firstVendor ? `Продаёт: ${getSourceName(firstVendor)}` : recipes[0] ? `Создать: ${recipes[0].station}` : obtainLabels[firstMethod] || 'Особый способ получения';
            const sourceNote = drops[0]?.rate || (drops[0]?.quantity ? `Количество: ${drops[0].quantity}` : null) || (shops[0] ? 'Условия — внутри карточки' : recipes[0] ? `${recipes.length} ${recipes.length === 1 ? 'рецепт' : 'вариантов рецепта'}` : 'Подробности — внутри карточки');
            return (
              <Reveal key={key} delay={Math.min((index % 8) * 0.04, 0.24)}>
                <article className="obtain-card obtain-card--catalog" style={{ '--item-accent': getItemColor(key) }}>
                  <div className="obtain-card__top"><TerrariaIcon itemKey={key} size="lg" layoutId={modal ? undefined : `item-icon-${key}`} /><span className="obtain-card__category">{getCategoryLabel(item.categories?.[0])}</span><button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(`item-${key}`)} aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /></button></div>
                  <h3>{getItemName(key)}</h3>{item.nameRu && <span className="obtain-card__english">{item.name}</span>}
                  <div className="obtain-card__methods">{(item.obtain || []).slice(0, 3).map((id) => <span key={id}>{obtainLabels[id] || id}</span>)}{item.unobtainable && <span className="is-unobtainable">Недоступно</span>}</div>
                  <div className="obtain-card__source">
                    {firstSource ? <SourceSprite source={firstSource} size={34} /> : firstVendor ? <SourceSprite source={firstVendor} size={34} /> : recipes[0] ? <GameSprite itemKey="WorkBench" size={30} /> : <NamedSprite icon={methodIcon} size={30} label={obtainLabels[firstMethod]} />}
                    <div><small>ПЕРВЫЙ ИСТОЧНИК</small><strong>{sourceTitle}</strong><span>{sourceNote}</span></div>
                  </div>
                  <button className="button button--soft button--full" onClick={() => setModal({ type: 'item', itemKey: key })}>Все способы получения <ChevronRight size={16} /></button>
                </article>
              </Reveal>
            );
          })}
        </div>
        <div className="catalog-bottom"><span>Страница {safePage} из {pageCount}</span><Pagination page={safePage} pageCount={pageCount} onChange={changePage} /></div>
      </> : <EmptyState icon="compass" title="Предметы не найдены" text="Попробуй русское или английское название, другой способ получения или сбрось фильтры." action={<button className="button button--soft" onClick={reset}>Сбросить фильтры</button>} />}
      <footer className="catalog-attribution">Предметы, источники и спрайты: <a href="https://terraria.wiki.gg/" target="_blank" rel="noreferrer">Official Terraria Wiki</a> / Doeschi · русские названия: игровая локализация Terraria</footer>
    </div>
  );
}
