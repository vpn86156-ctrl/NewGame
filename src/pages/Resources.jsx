import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Backpack, Check, ChevronRight, EyeOff, Heart, Minus, Plus,
  Search, SlidersHorizontal, Sparkles, Trash2, WandSparkles,
} from 'lucide-react';
import { useGame } from '../context';
import { recipes, resourceById, resources } from '../data';
import { EmptyState, ItemIcon, PageHeader, Reveal } from '../components/UI';

const emptyInventory = () => Object.fromEntries(resources.map((resource) => [resource.id, 0]));
const demoInventory = () => Object.fromEntries(resources.map((resource) => [resource.id, resource.initial]));

function RecipeResultCard({ recipe, inventory, onOpen, favorite, onFavorite }) {
  const ready = Object.entries(recipe.ingredients).every(([id, amount]) => (inventory[id] || 0) >= amount);
  const missing = Object.entries(recipe.ingredients).reduce((sum, [id, amount]) => sum + Math.max(0, amount - (inventory[id] || 0)), 0);
  return (
    <motion.button
      layout className={`recipe-result-card ${ready ? 'is-ready' : ''}`} onClick={onOpen}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
    >
      <ItemIcon icon={recipe.icon} color={recipe.color} size="lg" />
      <span className="recipe-result-card__body">
        <span className="recipe-result-card__title"><strong>{recipe.name}</strong>{recipe.output > 1 && <small>×{recipe.output}</small>}</span>
        <span className="recipe-result-card__station">{recipe.station}</span>
        <span className="ingredient-row">
          {Object.entries(recipe.ingredients).map(([id, amount]) => {
            const enough = (inventory[id] || 0) >= amount;
            return <span key={id} className={`ingredient-pill ${enough ? 'is-enough' : 'is-missing'}`}><i style={{ background: resourceById[id]?.color }} />{resourceById[id]?.short} <b>{inventory[id] || 0}/{amount}</b></span>;
          })}
        </span>
      </span>
      <span className={`recipe-result-card__state ${ready ? 'is-ready' : ''}`}>
        {ready ? <><Check size={13} /> МОЖНО</> : `−${missing}`}
      </span>
      <span
        className={`recipe-result-card__favorite ${favorite ? 'is-favorite' : ''}`} role="button" tabIndex={0}
        aria-label={favorite ? 'Убрать из избранного' : 'В избранное'}
        onClick={(event) => { event.stopPropagation(); onFavorite(); }}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); onFavorite(); } }}
      ><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /></span>
      <ChevronRight className="recipe-result-card__chevron" size={17} />
    </motion.button>
  );
}

export default function Resources() {
  const {
    inventory, setInventory, updateResource, currentStageIndex, spoilerFree,
    setModal, favorites, toggleFavorite, showToast,
  } = useGame();
  const [resourceQuery, setResourceQuery] = useState('');
  const [recipeQuery, setRecipeQuery] = useState('');
  const [tab, setTab] = useState('ready');
  const [onlyFilled, setOnlyFilled] = useState(false);

  const visibleRecipes = useMemo(() => recipes.filter((recipe) => {
    if (spoilerFree && recipe.stage > currentStageIndex) return false;
    return recipe.name.toLowerCase().includes(recipeQuery.toLowerCase());
  }), [currentStageIndex, recipeQuery, spoilerFree]);

  const withStatus = visibleRecipes.map((recipe) => {
    const missing = Object.entries(recipe.ingredients).reduce((sum, [id, amount]) => sum + Math.max(0, amount - (inventory[id] || 0)), 0);
    const hasSomething = Object.keys(recipe.ingredients).some((id) => (inventory[id] || 0) > 0);
    return { recipe, missing, hasSomething };
  });
  const ready = withStatus.filter((item) => item.missing === 0);
  const almost = withStatus.filter((item) => item.missing > 0 && item.missing <= 8 && item.hasSomething).sort((a, b) => a.missing - b.missing);
  const shown = tab === 'ready' ? ready : tab === 'almost' ? almost : withStatus;
  const filledResources = resources.filter((resource) => (inventory[resource.id] || 0) > 0).length;
  const shownResources = resources.filter((resource) => {
    if (onlyFilled && !(inventory[resource.id] > 0)) return false;
    return resource.name.toLowerCase().includes(resourceQuery.toLowerCase());
  });

  return (
    <div className="resources-page page-stack">
      <PageHeader
        eyebrow="ЧТО МОЖНО СДЕЛАТЬ ИЗ МОИХ РЕСУРСОВ?"
        title="Рюкзак подскажет."
        description="Отметь свою добычу — мы сравним её с рецептами и покажем, что уже можно создать."
      >
        <button className="button button--ghost" onClick={() => { setInventory(demoInventory()); showToast('Пример рюкзака восстановлен.', 'neutral'); }}><WandSparkles size={17} /> Демо-рюкзак</button>
      </PageHeader>

      <Reveal className="inventory-summary" delay={0.05}>
        <div className="inventory-summary__main"><span><Backpack size={24} /></span><div><small>ТВОЙ РЮКЗАК</small><strong>{filledResources} <em>из {resources.length} ресурсов</em></strong></div></div>
        <div className="inventory-summary__stat"><small>МОЖНО СОЗДАТЬ</small><strong>{ready.length}</strong><span>рецептов</span></div>
        <div className="inventory-summary__stat"><small>ПОЧТИ ГОТОВО</small><strong>{almost.length}</strong><span>рецептов</span></div>
        <div className="inventory-summary__note"><Sparkles size={16} /><span>Количество сохраняется автоматически</span></div>
      </Reveal>

      <div className="resources-layout">
        <Reveal className="inventory-panel" delay={0.08}>
          <div className="panel-heading">
            <div><span className="eyebrow">ШАГ 01</span><h2>Что у тебя есть?</h2></div>
            <button className="icon-button" title="Очистить рюкзак" aria-label="Очистить рюкзак" onClick={() => { setInventory(emptyInventory()); showToast('Рюкзак очищен.', 'neutral'); }}><Trash2 size={16} /></button>
          </div>
          <label className="field-with-icon"><Search size={16} /><input value={resourceQuery} onChange={(event) => setResourceQuery(event.target.value)} placeholder="Найти ресурс…" /></label>
          <div className="inventory-filter">
            <span>{shownResources.length} ресурсов</span>
            <button className={onlyFilled ? 'is-active' : ''} onClick={() => setOnlyFilled(!onlyFilled)}><SlidersHorizontal size={13} /> Только мои</button>
          </div>
          <div className="resource-list">
            {shownResources.map((resource) => (
              <div className={`resource-counter ${inventory[resource.id] > 0 ? 'has-items' : ''}`} key={resource.id}>
                <ItemIcon icon={resource.icon} color={resource.color} />
                <div className="resource-counter__name"><strong>{resource.name}</strong><span>{inventory[resource.id] > 0 ? 'В рюкзаке' : 'Не добавлено'}</span></div>
                <div className="stepper">
                  <button onClick={() => updateResource(resource.id, (inventory[resource.id] || 0) - 1)} disabled={!inventory[resource.id]} aria-label={`Убрать: ${resource.name}`}><Minus size={14} /></button>
                  <input
                    aria-label={`Количество: ${resource.name}`} type="number" min="0" max="9999" value={inventory[resource.id] || 0}
                    onChange={(event) => updateResource(resource.id, Number(event.target.value))}
                  />
                  <button onClick={() => updateResource(resource.id, (inventory[resource.id] || 0) + 1)} aria-label={`Добавить: ${resource.name}`}><Plus size={14} /></button>
                </div>
              </div>
            ))}
            {shownResources.length === 0 && <p className="small-empty">Такого ресурса пока нет в списке.</p>}
          </div>
        </Reveal>

        <Reveal className="recipe-results-panel" delay={0.14}>
          <div className="panel-heading recipe-results-panel__heading">
            <div><span className="eyebrow">ШАГ 02</span><h2>Что можно создать?</h2></div>
            <label className="field-with-icon field-with-icon--compact"><Search size={15} /><input value={recipeQuery} onChange={(event) => setRecipeQuery(event.target.value)} placeholder="Рецепт…" /></label>
          </div>
          <div className="segmented-tabs" role="tablist">
            <button className={tab === 'ready' ? 'is-active' : ''} onClick={() => setTab('ready')} role="tab"><Check size={14} /> Доступно <span>{ready.length}</span></button>
            <button className={tab === 'almost' ? 'is-active' : ''} onClick={() => setTab('almost')} role="tab">Почти хватает <span>{almost.length}</span></button>
            <button className={tab === 'all' ? 'is-active' : ''} onClick={() => setTab('all')} role="tab">Все <span>{visibleRecipes.length}</span></button>
          </div>
          {spoilerFree && <div className="compact-spoiler-note"><EyeOff size={14} /> Поздние рецепты скрыты без спойлеров</div>}
          <div className="recipe-results-list">
            <AnimatePresence mode="popLayout">
              {shown.map(({ recipe }) => (
                <RecipeResultCard
                  key={recipe.id} recipe={recipe} inventory={inventory} favorite={favorites.includes(recipe.id)}
                  onFavorite={() => toggleFavorite(recipe.id)} onOpen={() => setModal({ type: 'recipe', item: recipe })}
                />
              ))}
            </AnimatePresence>
            {shown.length === 0 && (
              <EmptyState
                icon={tab === 'ready' ? 'chest' : 'compass'}
                title={tab === 'ready' ? 'Пока не хватает материалов' : 'Ничего не найдено'}
                text={tab === 'ready' ? 'Добавь ресурсы в рюкзак или загляни во вкладку «Почти хватает».' : 'Попробуй изменить поиск или добавить часть материалов.'}
                action={tab === 'ready' ? <button className="button button--soft" onClick={() => setTab('almost')}>Что почти готово <ArrowRight size={16} /></button> : null}
              />
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
