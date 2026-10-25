import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight, Backpack, Check, ChevronRight, CirclePlus, EyeOff, Heart,
  Minus, PackagePlus, Plus, RotateCcw, Search, ShieldCheck, Sparkles, X,
} from 'lucide-react';
import { useGame } from '../context';
import {
  allGameRecipes, allItemKeys, defaultResourceKeys, getIngredientCount, getItem,
  getItemColor, getItemName, getRecipeStatus, getRecipesForItem, getStationLabel, isRecipeVisible,
  matchesSearch, recipesByResult,
} from '../gameData';
import { AnimatedNumber, EmptyState, PageHeader, Reveal } from '../components/UI';
import TerrariaIcon, { GameSprite } from '../components/TerrariaIcon';

const RECIPES_PER_PAGE = 12;

export default function Resources() {
  const { inventory, updateResource, setInventory, currentStageIndex, spoilerFree, setModal, favorites, toggleFavorite } = useGame();
  const [selected, setSelected] = useState('Wood');
  const [query, setQuery] = useState('');
  const [onlyReady, setOnlyReady] = useState(false);
  const [resourceGroup, setResourceGroup] = useState('all');
  const [resourceSearch, setResourceSearch] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [page, setPage] = useState(1);

  const inventoryKeys = useMemo(() => Object.keys(inventory).filter((key) => getItem(key)).sort((a, b) => {
    const aDefault = defaultResourceKeys.includes(a);
    const bDefault = defaultResourceKeys.includes(b);
    if (aDefault !== bDefault) return aDefault ? -1 : 1;
    if (aDefault && bDefault) return defaultResourceKeys.indexOf(a) - defaultResourceKeys.indexOf(b);
    return getItemName(a).localeCompare(getItemName(b), 'ru');
  }), [inventory]);
  const selectedRecipes = useMemo(() => allGameRecipes.filter((recipe) => recipe.ingredients.some((ingredient) => ingredient.options.includes(selected))), [selected]);
  const visibleRecipes = useMemo(() => {
    return selectedRecipes.filter((recipe) => {
      if (!isRecipeVisible(recipe, currentStageIndex, spoilerFree)) return false;
      const status = getRecipeStatus(recipe, inventory);
      if (onlyReady && !status.ready) return false;
      if (resourceGroup === 'almost' && (!status.hasSomething || status.ready)) return false;
      return matchesSearch(recipe.searchText, query);
    }).sort((a, b) => {
      const aStatus = getRecipeStatus(a, inventory);
      const bStatus = getRecipeStatus(b, inventory);
      return Number(bStatus.ready) - Number(aStatus.ready) || aStatus.missing - bStatus.missing || a.name.localeCompare(b.name, 'ru');
    });
  }, [currentStageIndex, inventory, onlyReady, query, resourceGroup, selectedRecipes, spoilerFree]);
  const readyCount = useMemo(() => allGameRecipes.filter((recipe) => isRecipeVisible(recipe, currentStageIndex, spoilerFree) && getRecipeStatus(recipe, inventory).ready).length, [currentStageIndex, inventory, spoilerFree]);
  const selectedReadyCount = selectedRecipes.filter((recipe) => isRecipeVisible(recipe, currentStageIndex, spoilerFree) && getRecipeStatus(recipe, inventory).ready).length;
  const hiddenSelected = selectedRecipes.length - selectedRecipes.filter((recipe) => isRecipeVisible(recipe, currentStageIndex, spoilerFree)).length;
  const pageCount = Math.max(1, Math.ceil(visibleRecipes.length / RECIPES_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const pageRecipes = visibleRecipes.slice((safePage - 1) * RECIPES_PER_PAGE, safePage * RECIPES_PER_PAGE);
  const totalUnits = Object.values(inventory).reduce((sum, amount) => sum + (Number(amount) || 0), 0);
  const resourceResults = useMemo(() => allItemKeys
    .filter((key) => matchesSearch(`${getItemName(key)} ${getItem(key)?.name || ''} ${key}`, resourceSearch))
    .slice(0, 60), [resourceSearch]);

  useEffect(() => { setPage(1); }, [query, onlyReady, resourceGroup, selected, currentStageIndex, spoilerFree]);
  useEffect(() => {
    if (!pickerOpen) setResourceSearch('');
  }, [pickerOpen]);

  const addResource = (key) => {
    updateResource(key, Math.max(1, inventory[key] || 0));
    setSelected(key);
    setPickerOpen(false);
  };
  const clearInventory = () => setInventory((current) => Object.fromEntries(Object.keys(current).map((key) => [key, 0])));
  const scrollToRecipes = () => {
    setOnlyReady(true);
    document.getElementById('recipe-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="resources-page page-stack">
      <PageHeader eyebrow="ТВОЙ РЮКЗАК · ПОЛНАЯ БАЗА" title="Из того, что уже есть." description={`Добавь любой из ${allItemKeys.length.toLocaleString('ru-RU')} предметов Terraria, укажи количество — и Гид проверит все ${allGameRecipes.length.toLocaleString('ru-RU')} рецептов.`}>
        <button className="button button--primary" onClick={scrollToRecipes}><Sparkles size={16} />Показать готовые крафты<AnimatedNumber className="button-badge" value={readyCount} /></button>
      </PageHeader>

      <div className="inventory-overview">
        <Reveal className="inventory-overview__lead"><span className="inventory-overview__icon"><Backpack size={23} /></span><div><span>РЮКЗАК ОТКРЫТ</span><strong>{inventoryKeys.length} видов · {totalUnits.toLocaleString('ru-RU')} предметов</strong></div></Reveal>
        <Reveal className="inventory-overview__stat" delay={0.04}><span>Можно создать сейчас</span><strong><AnimatedNumber value={readyCount} /><small> рецептов</small></strong></Reveal>
        <Reveal className="inventory-overview__stat" delay={0.08}><span>Выбрано для подбора</span><strong className="inventory-selected-name"><GameSprite itemKey={selected} size={22} />{getItemName(selected)}</strong></Reveal>
        <Reveal className="inventory-save" delay={0.12}><ShieldCheck size={17} /><span>Сохранено<br />в этом браузере</span></Reveal>
      </div>

      <div className="resources-workspace">
        <Reveal className="inventory-panel" delay={0.05}>
          <div className="panel-heading"><div><span className="eyebrow">01 / ТВОИ РЕСУРСЫ</span><h2>Что в рюкзаке?</h2></div><button className="icon-button" onClick={clearInventory} aria-label="Обнулить количество ресурсов" title="Обнулить количество"><RotateCcw size={16} /></button></div>
          <p className="panel-description">Выбери ресурс. Справа появятся все рецепты, где он нужен.</p>
          <div className="resource-add-wrap">
            <button className={`button button--soft button--full resource-add-button ${pickerOpen ? 'is-active' : ''}`} onClick={() => setPickerOpen(!pickerOpen)}>{pickerOpen ? <X size={16} /> : <PackagePlus size={16} />}{pickerOpen ? 'Закрыть поиск предметов' : 'Добавить любой предмет'}</button>
            <AnimatePresence initial={false}>{pickerOpen && (
              <motion.div className="resource-picker" initial={{ opacity: 0, y: -8, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.99 }} transition={{ duration: 0.2 }}>
                <label><Search size={15} /><input autoFocus value={resourceSearch} onChange={(event) => setResourceSearch(event.target.value)} placeholder="Зенит, кость или Bone…" /></label>
                <div className="resource-picker__results">
                  {resourceResults.map((key) => <button key={key} onClick={() => addResource(key)}><GameSprite itemKey={key} size={24} /><span><strong>{getItemName(key)}</strong><small>{getItem(key)?.name}</small></span>{inventory[key] > 0 && <b>{inventory[key]}</b>}<Plus size={14} /></button>)}
                  {resourceResults.length === 0 && <p>Такого предмета нет. Попробуй русское или английское название.</p>}
                </div>
              </motion.div>
            )}</AnimatePresence>
          </div>
          <div className="resource-list">
            {inventoryKeys.map((key) => (
              <div key={key} className={`resource-item ${selected === key ? 'is-selected' : ''}`} style={{ '--resource-color': getItemColor(key) }}>
                <button className="resource-item__select" onClick={() => setSelected(key)} aria-pressed={selected === key}><TerrariaIcon itemKey={key} size="md" /><span><strong>{getItemName(key)}</strong><small>{getItem(key)?.name}</small></span></button>
                <div className="resource-item__counter"><button onClick={() => updateResource(key, (inventory[key] || 0) - 1)} aria-label={`Убавить: ${getItemName(key)}`}><Minus size={12} /></button><input type="number" min="0" value={inventory[key] || 0} onChange={(event) => updateResource(key, event.target.value)} onFocus={() => setSelected(key)} aria-label={`Количество: ${getItemName(key)}`} /><button onClick={() => updateResource(key, (inventory[key] || 0) + 1)} aria-label={`Прибавить: ${getItemName(key)}`}><Plus size={12} /></button></div>
              </div>
            ))}
          </div>
          <div className="inventory-panel__hint"><CirclePlus size={15} /><span>Количество можно вписать вручную. Всё сохраняется автоматически.</span></div>
        </Reveal>

        <div className="recipe-matcher" id="recipe-results">
          <Reveal className="matcher-heading" delay={0.08}>
            <div><span className="eyebrow">02 / ПОДБОР ГИДА</span><h2>Куда потратить: {getItemName(selected)}</h2><p>{selectedReadyCount > 0 ? <><Sparkles size={13} /> Уже доступно: <strong>{selectedReadyCount}</strong></> : <>В базе для этого ресурса: <strong>{selectedRecipes.length}</strong> рецептов</>}</p></div>
            <button className={`ready-toggle ${onlyReady ? 'is-active' : ''}`} onClick={() => setOnlyReady(!onlyReady)}><span className="ready-toggle__check">{onlyReady && <Check size={12} />}</span>Только доступные</button>
          </Reveal>
          <Reveal className="matcher-filters" delay={0.1}>
            <label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти среди рецептов ресурса…" />{query && <button onClick={() => setQuery('')} aria-label="Очистить"><X size={13} /></button>}</label>
            <div className="segmented-tabs"><button className={resourceGroup === 'all' ? 'is-active' : ''} onClick={() => setResourceGroup('all')}>Все <span>{selectedRecipes.length}</span></button><button className={resourceGroup === 'almost' ? 'is-active' : ''} onClick={() => setResourceGroup('almost')}>Что-то есть</button></div>
          </Reveal>
          {spoilerFree && <div className="compact-spoiler-note"><EyeOff size={13} />Без спойлеров{hiddenSelected > 0 ? ` · скрыто ${hiddenSelected} поздних рецептов` : ''}</div>}
          <div className="recipe-results-list">
            {pageRecipes.map((recipe, index) => {
              const status = getRecipeStatus(recipe, inventory);
              const favorite = favorites.includes(recipe.id);
              return (
                <Reveal key={recipe.id} delay={Math.min(index * 0.04, 0.2)}>
                  <article className={`recipe-result-card ${status.ready ? 'is-ready' : ''}`} style={{ '--item-accent': recipe.color }}>
                    <button className="recipe-result-card__open" onClick={() => setModal({ type: 'recipe', item: recipe })} aria-label={`Открыть рецепт: ${recipe.name}`}>
                      <TerrariaIcon itemKey={recipe.result} size="lg" />
                      <div className="recipe-result-card__body"><div className="recipe-result-card__title"><strong>{recipe.name}{recipe.output > 1 ? ` ×${recipe.output}` : ''}</strong><small>{getCategoryName(recipe)}</small></div><span className="recipe-result-card__station">{recipe.station}</span><div className="ingredient-row">{recipe.ingredients.slice(0, 5).map((ingredient) => {
                        const have = getIngredientCount(inventory, ingredient);
                        const enough = have >= ingredient.amount;
                        return <span key={`${ingredient.group || ingredient.key}-${ingredient.amount}`} className={`ingredient-pill ${enough ? 'is-enough' : 'is-missing'}`} title={ingredient.name}><GameSprite itemKey={ingredient.iconKey} size={16} /><span>{ingredient.group ? 'Группа' : getItemName(ingredient.key)}</span><b>{have}/{ingredient.amount}</b></span>;
                      })}{recipe.ingredients.length > 5 && <span className="ingredient-pill">+{recipe.ingredients.length - 5}</span>}</div></div>
                    </button>
                    <span className={`recipe-result-card__state ${status.ready ? 'is-ready' : ''}`}>{status.ready ? <><Check size={12} />МОЖНО СОЗДАТЬ</> : <>НЕ ХВАТАЕТ: {status.missing}</>}</span>
                    <button className={`recipe-result-card__favorite ${favorite ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(recipe.id)} aria-label="Избранное"><Heart size={14} fill={favorite ? 'currentColor' : 'none'} /></button>
                    <button className="recipe-result-card__chevron" onClick={() => setModal({ type: 'recipe', item: recipe })} aria-label="Подробнее"><ChevronRight size={17} /></button>
                  </article>
                </Reveal>
              );
            })}
          </div>
          {visibleRecipes.length === 0 && (selectedRecipes.length === 0 ? (
            <EmptyState icon="compass" title="Не используется в рецептах" text={`${getItemName(selected)} можно хранить в рюкзаке, но сейчас этот предмет не требуется ни для одного крафта. В карточке есть способы получения.`} action={<button className="button button--soft" onClick={() => setModal({ type: 'item', itemKey: selected })}>Как получить этот предмет <ChevronRight size={15} /></button>} />
          ) : (
            <EmptyState icon="workbench" title={onlyReady ? 'Пока не хватает ресурсов' : 'Рецептов не найдено'} text={onlyReady ? 'Добавь недостающие ингредиенты или покажи все рецепты — Гид подскажет, чего не хватает.' : 'Попробуй другой запрос или выбери другой ресурс.'} action={<button className="button button--soft" onClick={() => { setOnlyReady(false); setResourceGroup('all'); setQuery(''); }}>Показать все рецепты</button>} />
          ))}
          {pageCount > 1 && <div className="resource-pagination"><button className="button button--ghost" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>Назад</button><span>Страница {safePage} / {pageCount}</span><button className="button button--ghost" disabled={safePage === pageCount} onClick={() => setPage(safePage + 1)}>Дальше <ArrowUpRight size={14} /></button></div>}
        </div>
      </div>
    </div>
  );
}

function getCategoryName(recipe) {
  return getRecipesForItem(recipe.result).length > 1 ? `Вариантов: ${recipesByResult[recipe.result].length}` : getStationLabel(recipe.stations[0]);
}
