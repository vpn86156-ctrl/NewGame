import { ArrowUpRight, Backpack, Check, ChevronLeft, ChevronRight, Coins, ExternalLink, Hammer, MapPin, PackageOpen, Plus, Sparkles } from 'lucide-react';
import { useGame } from '../context';
import {
  biomeLabels, conditionLabels, eventLabels, gameCatalog, getCategoryLabel, getItem,
  getItemColor, getItemName, getRecipesForItem, getSourceName, obtainLabels,
} from '../gameData';
import { Modal } from './UI';
import TerrariaIcon, { GameSprite, NamedSprite, SourceSprite } from './TerrariaIcon';

const sourceKindLabels = { npc: 'Противник или существо', bag: 'Мешок сокровищ', container: 'Сундук, ящик или объект' };
const variantLabels = {
  Underground: 'Подземелье', Cavern: 'Пещеры', 'Cavern (lava layer)': 'Лавовый слой пещер',
  'Second Form': 'Вторая форма', 'Pre-Hardmode variant': 'Вариант до хардмода',
  'Hardmode variant': 'Вариант в хардмоде', 'Dark Lamia': 'Тёмная ламия',
};
const timeLabels = { day: 'Днём', night: 'Ночью' };
const dropBackedMethods = new Set(['crafted', 'vendor', 'drop', 'loot', 'bag', 'treasure-bag', 'shaking-tree']);

function SourceTags({ entry, source }) {
  const biomeIds = [...new Set([...(source?.biomes || []), ...(entry.biomes || [])])];
  const eventIds = [...new Set([...(source?.events || []), ...(entry.events || [])])];
  const conditionIds = entry.conditions || [];
  const times = source?.times || [];
  const variants = entry.variants || [];
  const tags = [
    ...biomeIds.map((id) => biomeLabels[id] || id),
    ...eventIds.map((id) => eventLabels[id] || id),
    ...conditionIds.map((id) => conditionLabels[id] || id),
    ...times.map((id) => timeLabels[id] || id),
    ...variants.map((id) => variantLabels[id] || id),
  ];
  if (!tags.length) return null;
  return <div className="acquisition-tags">{[...new Set(tags)].map((tag) => <span key={tag}>{tag}</span>)}</div>;
}

function DropCard({ drop }) {
  const source = gameCatalog.sources[drop.source];
  if (!source) return null;
  return (
    <article className="acquisition-source">
      <div className="acquisition-source__visual"><SourceSprite source={source} size={52} /></div>
      <div className="acquisition-source__body">
        <span className="acquisition-source__kind">{sourceKindLabels[source.kind] || 'Источник'}</span>
        <h4>{getSourceName(source)}</h4>
        <div className="acquisition-source__numbers">
          {drop.rate && <span><small>ШАНС</small><strong>{drop.rate}</strong></span>}
          {drop.quantity && <span><small>КОЛИЧЕСТВО</small><strong>{drop.quantity}</strong></span>}
        </div>
        <SourceTags entry={drop} source={source} />
        {drop.note && !drop.conditions?.length && <p className="acquisition-source__note">Есть дополнительное условие получения.</p>}
      </div>
      {source.url && <a className="acquisition-source__link" href={source.url} target="_blank" rel="noreferrer" aria-label={`${getSourceName(source)} на Terraria Wiki`}><ArrowUpRight size={15} /></a>}
    </article>
  );
}

function ShopCard({ shop }) {
  const vendor = gameCatalog.vendors[shop.vendor];
  if (!vendor) return null;
  const hasStructuredConditions = Boolean(shop.conditions?.length || shop.events?.length || shop.biomes?.length);
  return (
    <article className="acquisition-source">
      <div className="acquisition-source__visual"><SourceSprite source={vendor} size={52} /></div>
      <div className="acquisition-source__body">
        <span className="acquisition-source__kind">Магазин NPC</span>
        <h4>{getSourceName(vendor)}</h4>
        <SourceTags entry={shop} source={null} />
        {!hasStructuredConditions && <p className="acquisition-source__note">{shop.vendor === 'traveling-merchant' ? 'Появляется в случайном ассортименте во время визита.' : shop.vendor === 'skeleton-merchant' ? 'Ассортимент зависит от обстоятельств визита.' : 'Доступно в обычном магазине без особых условий.'}</p>}
        {hasStructuredConditions && shop.text && <p className="acquisition-source__note">Проверь указанные выше условия перед покупкой.</p>}
      </div>
    </article>
  );
}

export default function ItemDetailsModal({ itemKey, returnRecipe = null }) {
  const { setModal, favorites, toggleFavorite, navigate } = useGame();
  const item = getItem(itemKey);
  if (!item) return null;
  const recipes = getRecipesForItem(itemKey);
  const drops = gameCatalog.drops[itemKey] || [];
  const shops = gameCatalog.shops[itemKey] || [];
  const guides = gameCatalog.acquisitionGuides?.[itemKey] || [];
  const genericMethods = (item.obtain || []).filter((id) => !dropBackedMethods.has(id) && !(id === 'plunder' && guides.length));
  const favoriteId = `item-${itemKey}`;
  const favorite = favorites.includes(favoriteId);
  const hasSources = recipes.length + drops.length + shops.length + genericMethods.length + guides.length > 0;
  const description = item.tooltipRu || `Полный игровой предмет Terraria. Ниже собраны все известные способы получения: ${(item.obtain || []).map((id) => obtainLabels[id] || id).join(', ') || 'особые условия'}.`;

  return (
    <Modal onClose={() => setModal(null)} label={`Как получить: ${getItemName(itemKey)}`} className="item-modal item-details-modal">
      <div className="item-modal__hero" style={{ '--item-accent': getItemColor(itemKey) }}>
        <TerrariaIcon itemKey={itemKey} size="xl" />
        <div><span className="eyebrow">{getCategoryLabel(item.categories?.[0])} · КАК ПОЛУЧИТЬ</span><h2>{getItemName(itemKey)}</h2>{item.nameRu && <span className="item-modal__english">{item.name}</span>}</div>
        <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(favoriteId)} aria-label="Избранное"><Sparkles size={18} fill={favorite ? 'currentColor' : 'none'} /></button>
      </div>
      <p className="item-modal__description">{description}</p>
      <div className="item-detail-methods">{(item.obtain || []).map((id) => <span key={id}>{obtainLabels[id] || id}</span>)}{item.unobtainable && <span className="is-unobtainable">Недоступно в обычной игре</span>}</div>

      {guides.length > 0 && <section className="modal-section acquisition-section">
        <span className="eyebrow"><MapPin size={12} /> НАГЛЯДНЫЙ МАРШРУТ</span>
        <div className="visual-acquisition-guides">{guides.map((guide) => <article className="visual-acquisition-guide" key={guide.title}>
          <a href={guide.url} target="_blank" rel="noreferrer" className="visual-acquisition-guide__image"><img src={guide.image} alt={guide.imageAlt} /></a>
          <div><span className="acquisition-source__kind">Объект в мире</span><h3>{guide.title}</h3><p>{guide.text}</p><div className="acquisition-tags"><span>{guide.biome}</span><span>Шанс: {guide.rate}</span></div></div>
        </article>)}</div>
      </section>}

      {recipes.length > 0 && <section className="modal-section acquisition-section">
        <span className="eyebrow"><Hammer size={12} /> СОЗДАТЬ · {recipes.length}</span>
        <div className="acquisition-recipes">
          {recipes.map((recipe, index) => <button key={recipe.id} onClick={() => setModal({ type: 'recipe', item: recipe })}>
            <span className="acquisition-recipe__icon"><GameSprite itemKey="WorkBench" size={30} /></span>
            <span><strong>{recipes.length > 1 ? `Рецепт · вариант ${index + 1}` : 'Открыть рецепт'}</strong><small>{recipe.station}</small><span className="acquisition-recipe__ingredients">{recipe.ingredients.slice(0, 8).map((ingredient) => <GameSprite key={`${ingredient.group || ingredient.key}-${ingredient.amount}`} itemKey={ingredient.iconKey} size={19} />)}{recipe.ingredients.length > 8 && <b>+{recipe.ingredients.length - 8}</b>}</span></span>
            <ChevronRight size={17} />
          </button>)}
        </div>
      </section>}

      {drops.length > 0 && <section className="modal-section acquisition-section">
        <span className="eyebrow"><PackageOpen size={12} /> ДРОП, СУНДУКИ И КОНТЕЙНЕРЫ · {drops.length}</span>
        <div className="acquisition-sources">{drops.map((drop, index) => <DropCard key={`${drop.source}-${index}`} drop={drop} />)}</div>
      </section>}

      {shops.length > 0 && <section className="modal-section acquisition-section">
        <span className="eyebrow"><Coins size={12} /> КУПИТЬ У NPC · {shops.length}</span>
        <div className="acquisition-sources">{shops.map((shop, index) => <ShopCard key={`${shop.vendor}-${index}`} shop={shop} />)}</div>
      </section>}

      {genericMethods.length > 0 && <section className="modal-section acquisition-section">
        <span className="eyebrow"><MapPin size={12} /> ДРУГИЕ СПОСОБЫ</span>
        <div className="acquisition-sources">{genericMethods.map((id) => {
          const method = gameCatalog.obtainMethods.find((entry) => entry.id === id);
          return <article className="acquisition-source" key={id}><div className="acquisition-source__visual"><NamedSprite icon={method?.icon?.split('/').pop()} label={obtainLabels[id]} size={46} /></div><div className="acquisition-source__body"><span className="acquisition-source__kind">Способ получения</span><h4>{obtainLabels[id] || method?.name || id}</h4><SourceTags entry={item} source={null} /></div></article>;
        })}</div>
      </section>}

      {!hasSources && <div className="acquisition-empty"><PackageOpen size={25} /><div><strong>Точный источник не указан</strong><p>{item.unobtainable ? 'Этот предмет есть в данных игры, но его нельзя получить обычным способом.' : 'Для этого предмета в базе нет отдельной записи о получении. Открой официальную wiki за подробностями.'}</p></div></div>}

      <div className="modal-actions item-details-actions">
        {returnRecipe && <button className="button button--soft" onClick={() => setModal({ type: 'recipe', item: returnRecipe })}><ChevronLeft size={17} /> К рецепту</button>}
        <button className="button button--soft" onClick={() => { setModal(null); navigate('resources'); }}><Backpack size={17} /> В рюкзак</button>
        {item.url && <a className="button button--ghost" href={item.url} target="_blank" rel="noreferrer">Wiki <ExternalLink size={14} /></a>}
        <button className="button button--primary" onClick={() => setModal({ type: 'journal-new', prefill: { title: `Найти: ${getItemName(itemKey)}`, text: `Способы: ${(item.obtain || []).map((id) => obtainLabels[id] || id).join(', ')}`, tag: 'Находка' } })}><Plus size={16} /> В дневник</button>
      </div>
    </Modal>
  );
}
