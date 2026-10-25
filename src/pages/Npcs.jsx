import { forwardRef, useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Coins, Heart, HeartCrack, Home, Search, Sparkles, Users, X } from 'lucide-react';
import { getNpcName, matchesSearch, npcById, otherTownNpcs, townNpcs } from '../gameData';
import { EmptyState, PageHeader, Reveal } from '../components/UI';
import { GameSprite, NamedSprite } from '../components/TerrariaIcon';

const biomeInfo = {
  forest: { name: 'Лес', icon: 'Acorn' }, hallow: { name: 'Освящение', icon: 'PearlstoneBlock' },
  underground: { name: 'Подземелье', icon: 'StoneBlock' }, desert: { name: 'Пустыня', icon: 'SandBlock' },
  jungle: { name: 'Джунгли', icon: 'MudBlock' }, ocean: { name: 'Океан', icon: 'Seashell' },
  snow: { name: 'Снежный биом', icon: 'SnowBlock' }, mushroom: { name: 'Светящиеся грибы', icon: 'GlowingMushroom' },
  'n/a': { name: 'Любой биом', icon: 'Sunflower' },
};
const relationInfo = {
  loved: { label: 'Любит', effect: '−12%', className: 'is-loved' },
  liked: { label: 'Нравятся', effect: '−6%', className: 'is-liked' },
  disliked: { label: 'Не нравятся', effect: '+6%', className: 'is-disliked' },
  hated: { label: 'Ненавидит', effect: '+12%', className: 'is-hated' },
};
const happinessRules = [
  { icon: '❤', title: 'Любимый сосед или биом', value: '×0,88', note: 'Цены ниже на 12%', tone: 'loved' },
  { icon: '✓', title: 'Нравится сосед или биом', value: '×0,94', note: 'Цены ниже на 6%', tone: 'liked' },
  { icon: '×', title: 'Не нравится', value: '×1,06', note: 'Цены выше на 6%', tone: 'disliked' },
  { icon: '!', title: 'Ненависть', value: '×1,12', note: 'Цены выше на 12%', tone: 'hated' },
  { icon: '⌂', title: 'Уединение', value: '×0,95', note: 'Не более двух соседей рядом', tone: 'liked' },
  { icon: '♟', title: 'Теснота', value: '×1,05', note: 'За каждого соседа сверх трёх', tone: 'disliked' },
];

function Neighbor({ id }) {
  const npc = npcById[id];
  if (!npc) return null;
  return <span className="npc-neighbor" title={npc.name}><NamedSprite icon={npc.icon} label={getNpcName(id)} size={26} /><span>{getNpcName(id)}</span></span>;
}

function BiomePreference({ type, id, santa }) {
  const biome = biomeInfo[id] || biomeInfo['n/a'];
  const liked = type === 'liked';
  const effect = santa ? (liked ? '−12%' : '+12%') : (liked ? '−6%' : '+6%');
  return <div className={`npc-biome ${liked ? 'is-liked' : 'is-disliked'}`}><GameSprite itemKey={biome.icon} size={25} /><span><small>{liked ? (santa ? 'ЛЮБИМЫЙ БИОМ' : 'НРАВИТСЯ') : (santa ? 'НЕНАВИДИТ' : 'НЕ НРАВИТСЯ')}</small><strong>{biome.name}</strong></span><b>{effect}</b></div>;
}

const NpcCard = forwardRef(function NpcCard({ npc }, ref) {
  const reduceMotion = useReducedMotion();
  const isPrincess = npc.special === 'princess';
  const isSanta = npc.special === 'santa';
  const hasLoved = npc.neighbors.loved.length > 0;
  const hasLiked = npc.neighbors.liked.length > 0;
  const neighborFactor = hasLoved ? 0.88 : hasLiked ? 0.94 : 1;
  const biomeFactor = isSanta ? 0.88 : npc.biome.liked !== 'n/a' ? 0.94 : 1;
  const estimate = Math.max(0.75, Math.min(1.5, neighborFactor * biomeFactor * 0.95));
  return (
    <motion.article
      ref={ref} className="npc-card" id={`npc-${npc.id}`} layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.985 }}
      transition={{ duration: 0.3, layout: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }}
    >
      <header className="npc-card__header">
        <div className="npc-card__portrait"><NamedSprite icon={npc.icon} label={getNpcName(npc.id)} size={74} /></div>
        <div><span className="eyebrow">ГОРОДСКОЙ NPC</span><h2>{getNpcName(npc.id)}</h2><span className="npc-card__english">{npc.name}</span><p>{npc.role}</p></div>
      </header>
      <div className="npc-card__biomes">
        {npc.biome.liked !== 'n/a' ? <><BiomePreference type="liked" id={npc.biome.liked} santa={isSanta} /><BiomePreference type="disliked" id={npc.biome.disliked} santa={isSanta} /></> : <div className="npc-biome is-neutral"><GameSprite itemKey="Sunflower" size={25} /><span><small>БИОМЫ</small><strong>Все биомы нейтральны</strong></span></div>}
      </div>
      {isPrincess ? <div className="npc-special"><Sparkles size={17} /><div><strong>Особые правила Принцессы</strong><p>Любит до трёх соседей и не любит уединение. Остальные NPC относятся к ней положительно, а биом не влияет на её цены.</p></div></div> : <div className="npc-relations">
        {Object.entries(relationInfo).map(([relation, info]) => npc.neighbors[relation].length > 0 && <div className={`npc-relation ${info.className}`} key={relation}><div className="npc-relation__label"><span>{info.label}</span><b>{info.effect}</b></div><div className="npc-relation__neighbors">{npc.neighbors[relation].map((id) => <Neighbor key={id} id={id} />)}</div></div>)}
      </div>}
      {npc.id === 'truffle' && <div className="npc-card__note"><Home size={14} /> Для дома нужен поверхностный светящийся грибной биом.</div>}
      {npc.id === 'taxcollector' && <div className="npc-card__note"><Coins size={14} /> Счастье увеличивает скорость и максимум собираемых налогов.</div>}
      {npc.id === 'angler' && <div className="npc-card__note"><Sparkles size={14} /> Счастье улучшает награды за рыболовные задания.</div>}
      {!isPrincess && <footer className="npc-card__footer"><span><Coins size={14} /> Пример с хорошим соседом, биомом и уединением</span><strong>≈ {Math.round(estimate * 100)}% цены</strong></footer>}
    </motion.article>
  );
});

export default function Npcs() {
  const [query, setQuery] = useState('');
  const [biome, setBiome] = useState('all');
  const reduceMotion = useReducedMotion();
  const revealEmptyState = useCallback((node) => {
    if (!node) return;
    requestAnimationFrame(() => {
      if (node.isConnected) node.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
  }, [reduceMotion]);
  const visible = useMemo(() => townNpcs.filter((npc) => {
    if (biome !== 'all' && npc.biome.liked !== biome) return false;
    const relations = Object.values(npc.neighbors).flat().map(getNpcName).join(' ');
    return matchesSearch(`${getNpcName(npc.id)} ${npc.name} ${npc.role} ${relations}`, query);
  }), [biome, query]);

  return (
    <div className="npc-page page-stack">
      <PageHeader eyebrow={`ЖИТЕЛИ МИРА · ${townNpcs.length} NPC С ПРЕДПОЧТЕНИЯМИ`} title="Все NPC. Удобные соседи — лучшие цены." description="Настоящие игровые спрайты, любимые биомы и соседи, а также понятные бонусы счастья. Нажми Ctrl+K, если нужен конкретный житель или предмет из его магазина.">
        <div className="npc-header-emblem"><Users size={27} /><span><strong>{visible.length}</strong> жителей<br />в подборке</span></div>
      </PageHeader>

      <Reveal className="happiness-guide">
        <div className="happiness-guide__heading"><div><span className="eyebrow">КАК РАБОТАЕТ СЧАСТЬЕ</span><h2>Множители перемножаются</h2><p>Например: любимый сосед × подходящий биом × уединение = 0,88 × 0,94 × 0,95 ≈ <strong>79% цены</strong>. Итоговый модификатор ограничен диапазоном 75–150%.</p></div><Heart size={30} /></div>
        <div className="happiness-rules">{happinessRules.map((rule) => <div className={`happiness-rule is-${rule.tone}`} key={rule.title}><span>{rule.icon}</span><div><small>{rule.title}</small><strong>{rule.value}</strong><p>{rule.note}</p></div></div>)}</div>
        <div className="happiness-specials"><span><strong>Медсестра и Гоблин-инженер:</strong> счастье снижает стоимость лечения и перековки.</span><span><strong>Рыбак и Сборщик налогов:</strong> счастье улучшает награды и доход.</span><span><strong>Пилоны:</strong> нужны два NPC рядом; городские питомцы тоже учитываются, но не создают тесноту.</span></div>
      </Reveal>

      <Reveal className="npc-toolbar">
        <label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="NPC или его любимый сосед…" />{query && <button onClick={() => setQuery('')} aria-label="Очистить поиск"><X size={14} /></button>}</label>
        <div className="filter-chips"><button className={biome === 'all' ? 'is-active' : ''} onClick={() => setBiome('all')}>Все биомы</button>{Object.entries(biomeInfo).filter(([id]) => id !== 'n/a').map(([id, info]) => <button key={id} className={biome === id ? 'is-active' : ''} onClick={() => setBiome(id)}>{info.name}</button>)}</div>
      </Reveal>

      <AnimatePresence mode="wait" initial={false}>
        {visible.length > 0 ? (
          <motion.div className="npc-grid" key="npc-results" initial={false} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <AnimatePresence mode="popLayout">{visible.map((npc) => <NpcCard key={npc.id} npc={npc} />)}</AnimatePresence>
          </motion.div>
        ) : (
          <motion.div ref={revealEmptyState} className="npc-empty" key="npc-empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.22 }}>
            <EmptyState icon="home" title="Такой житель не найден" text="Попробуй другое имя или выбери все биомы." action={<button className="button button--soft" onClick={() => { setQuery(''); setBiome('all'); }}>Сбросить поиск</button>} />
          </motion.div>
        )}
      </AnimatePresence>

      <Reveal className="other-npcs">
        <div className="section-heading"><div><span className="eyebrow">ТОЖЕ ВСТРЕТЯТСЯ В МИРЕ</span><h2>Гости и городские питомцы</h2><p>У них нет обычной таблицы предпочтений, но они тоже являются частью жизни города.</p></div><HeartCrack size={23} /></div>
        <div className="other-npcs__grid">{otherTownNpcs.map((npc) => <article key={npc.id}><div><NamedSprite icon={npc.icon} label={npc.nameRu} size={58} /></div><span><strong>{npc.nameRu}</strong><small>{npc.name}</small><p>{npc.role}</p></span></article>)}</div>
      </Reveal>
      <footer className="catalog-attribution">Предпочтения и правила: <a href="https://terraria.wiki.gg/wiki/NPCs/preferences" target="_blank" rel="noreferrer">Official Terraria Wiki</a> · спрайты Terraria © Re-Logic</footer>
    </div>
  );
}
