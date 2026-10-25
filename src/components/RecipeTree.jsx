import { useState } from 'react';
import { Check, ChevronDown, ChevronRight, GitBranch, Hammer, MapPin, PackageOpen } from 'lucide-react';
import { useGame } from '../context';
import {
  gameCatalog, getIngredientCount, getItemName, getRecipesForItem, getSourceName, obtainLabels,
} from '../gameData';
import TerrariaIcon from './TerrariaIcon';

function recipeComplexity(recipe, ancestry, depth = 0) {
  if (depth > 5) return 0;
  return recipe.ingredients.reduce((total, ingredient) => {
    const best = Math.min(...ingredient.options.map((key) => {
      if (ancestry.includes(key)) return 40;
      const methods = gameCatalog.items[key]?.obtain || [];
      if (methods.includes('plunder')) return 0;
      if (methods.some((id) => ['drop', 'fishing', 'caught'].includes(id))) return 0.05;
      if (methods.some((id) => ['loot', 'bag', 'vendor', 'quest-reward'].includes(id))) return 0.15;
      const nested = getRecipesForItem(key);
      if (!nested.length) return 0;
      return 1 + Math.min(...nested.map((entry) => recipeComplexity(entry, [...ancestry, key], depth + 1)));
    }));
    return total + best;
  }, 0);
}

function chooseRecipe(recipes, ancestry) {
  if (recipes.length <= 1) return recipes[0];
  return [...recipes].sort((a, b) => recipeComplexity(a, ancestry) - recipeComplexity(b, ancestry))[0];
}

function getLeafSource(key) {
  const item = gameCatalog.items[key];
  const drop = gameCatalog.drops[key]?.[0];
  const shop = gameCatalog.shops[key]?.[0];
  if (drop) return `Найти: ${getSourceName(gameCatalog.sources[drop.source])}`;
  if (shop) return `Купить: ${getSourceName(gameCatalog.vendors[shop.vendor])}`;
  const method = (item?.obtain || []).find((id) => id !== 'crafted');
  return method ? obtainLabels[method] || method : 'Открыть способы получения';
}

function TreeBranch({ ingredient, requiredAmount, ancestry, depth, inventory, onOpenItem, path }) {
  const chooseOption = () => ingredient.key || [...ingredient.options].sort((a, b) =>
    (inventory[b] || 0) - (inventory[a] || 0) || Number(Boolean(getRecipesForItem(b).length)) - Number(Boolean(getRecipesForItem(a).length)))[0];
  const [selectedKey, setSelectedKey] = useState(chooseOption);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const recipes = getRecipesForItem(selectedKey);
  const recipe = recipes.find((entry) => entry.id === selectedRecipeId) || chooseRecipe(recipes, [...ancestry, selectedKey]);
  const cyclic = ancestry.includes(selectedKey);
  const expandable = Boolean(recipe && !cyclic && depth < 16);
  const crafts = recipe ? Math.max(1, Math.ceil(requiredAmount / recipe.output)) : 0;
  const have = getIngredientCount(inventory, { ...ingredient, key: selectedKey });
  const enough = have >= requiredAmount;

  const changeOption = (key) => {
    setSelectedKey(key);
    setSelectedRecipeId(null);
    setExpanded(false);
  };

  return (
    <li className={`recipe-tree-branch ${enough ? 'has-enough' : 'is-missing'}`}>
      <div className="recipe-tree-node">
        <TerrariaIcon itemKey={selectedKey} size="sm" />
        <button
          className="recipe-tree-node__main"
          onClick={() => expandable ? setExpanded(!expanded) : onOpenItem(selectedKey)}
          aria-expanded={expandable ? expanded : undefined}
          aria-label={expandable ? `${expanded ? 'Свернуть' : 'Раскрыть'} ветвь: ${getItemName(selectedKey)}` : `Где получить: ${getItemName(selectedKey)}`}
        >
          <span><strong>{getItemName(selectedKey)}</strong>{ingredient.group && <em>Один из {ingredient.options.length} вариантов</em>}</span>
          <small>{recipe ? cyclic ? 'Эта ветвь уже показана выше' : `${recipe.station}${crafts > 1 ? ` · ${crafts} крафта` : ''}` : getLeafSource(selectedKey)}</small>
        </button>
        <span className="recipe-tree-node__amount"><b>×{requiredAmount}</b><small className={enough ? 'has-enough' : 'not-enough'}>{enough ? <Check size={11} /> : null} Есть {have}</small></span>
        <span className="recipe-tree-node__chevron">{expandable ? expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} /> : <MapPin size={15} />}</span>
      </div>

      {ingredient.group && <label className="recipe-tree-group"><span>Вариант для этой ветви</span><select value={selectedKey} onChange={(event) => changeOption(event.target.value)}>{ingredient.options.map((key) => <option key={key} value={key}>{getItemName(key)} · в рюкзаке {inventory[key] || 0}</option>)}</select></label>}

      {expanded && recipe && <div className="recipe-tree-branch__children">
        <div className="recipe-tree-recipe-line">
          <span><Hammer size={13} /> {recipe.station}{crafts > 1 ? ` · повторить ${crafts} раза` : ''}</span>
          <button onClick={() => onOpenItem(selectedKey)}><MapPin size={12} /> Все способы получения</button>
        </div>
        {recipes.length > 1 && <label className="recipe-tree-group"><span>Рецепт для этой ветви</span><select value={recipe.id} onChange={(event) => setSelectedRecipeId(event.target.value)}>{recipes.map((entry, index) => <option key={entry.id} value={entry.id}>Вариант {index + 1} · {entry.station}</option>)}</select></label>}
        <ul className="recipe-tree-children">
          {recipe.ingredients.map((child, index) => <TreeBranch
            key={`${path}-${index}-${child.group || child.key}`}
            path={`${path}-${index}`}
            ingredient={child}
            requiredAmount={child.amount * crafts}
            ancestry={[...ancestry, selectedKey]}
            depth={depth + 1}
            inventory={inventory}
            onOpenItem={onOpenItem}
          />)}
        </ul>
      </div>}
    </li>
  );
}

export default function RecipeTree({ recipe }) {
  const { inventory, setModal } = useGame();
  const openItem = (itemKey) => setModal({ type: 'item', itemKey, returnRecipe: recipe, returnView: 'tree' });
  return (
    <div className="recipe-tree">
      <div className="recipe-tree__intro">
        <span><GitBranch size={17} /></span>
        <div><strong>Дерево создания</strong><p>Раскрывай создаваемые предметы, пока не останутся находки, дроп и покупки. Количество в каждой ветви уже учитывает выход рецепта.</p></div>
      </div>
      <div className="recipe-tree-root">
        <TerrariaIcon itemKey={recipe.result} size="lg" />
        <div><small>КОРЕНЬ ДЕРЕВА</small><strong>{recipe.name}{recipe.output > 1 ? ` ×${recipe.output}` : ''}</strong><span><Hammer size={12} /> {recipe.station}</span></div>
        <b>{recipe.ingredients.length} {recipe.ingredients.length === 1 ? 'ветвь' : 'ветвей'}</b>
      </div>
      <ul className="recipe-tree__branches">
        {recipe.ingredients.map((ingredient, index) => <TreeBranch
          key={`${index}-${ingredient.group || ingredient.key}`}
          path={`root-${index}`}
          ingredient={ingredient}
          requiredAmount={ingredient.amount}
          ancestry={[recipe.result]}
          depth={0}
          inventory={inventory}
          onOpenItem={openItem}
        />)}
      </ul>
      <div className="recipe-tree__legend"><span><Hammer size={12} /> Создать</span><span><MapPin size={12} /> Найти или купить</span><span><PackageOpen size={12} /> Нажатие на находку открывает источники</span></div>
    </div>
  );
}
