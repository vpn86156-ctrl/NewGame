import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle, Backpack, BookOpen, Check, CheckCircle2, ChevronDown, ChevronRight,
  Compass, Eye, EyeOff, Hammer, Home, Info, Map, Menu, Play, RotateCcw, Search,
  ScrollText, Sparkles, TreePine, Users, X,
} from 'lucide-react';
import { useGame } from './context';
import { stages } from './data';
import { Brand, PixelGuide } from './components/UI';
import Intro from './components/Intro';
import ModalRoot from './components/Modals';
import SearchPalette from './components/SearchPalette';
import HomePage from './pages/Home';
import Path from './pages/Path';
import Resources from './pages/Resources';
import { Crafts, Obtain } from './pages/Library';
import Stories from './pages/Stories';
import Journal from './pages/Journal';
import Npcs from './pages/Npcs';

const navGroups = [
  {
    label: 'ПРИКЛЮЧЕНИЕ', items: [
      { id: 'home', label: 'Главная', icon: Home },
      { id: 'path', label: 'Путь мира', icon: Map, badge: true },
    ],
  },
  {
    label: 'БИБЛИОТЕКА', items: [
      { id: 'resources', label: 'Из моих ресурсов', icon: Backpack },
      { id: 'crafts', label: 'Все крафты', icon: Hammer },
      { id: 'obtain', label: 'Как получить', icon: Compass },
      { id: 'npcs', label: 'Все NPC', icon: Users },
    ],
  },
  {
    label: 'ИСТОРИИ', items: [
      { id: 'stories', label: 'Сюжет Terraria', icon: BookOpen },
      { id: 'journal', label: 'Мой дневник', icon: ScrollText },
    ],
  },
];

function Sidebar() {
  const { view, navigate, currentStageIndex, progress, mobileNavOpen, setMobileNavOpen, setModal, allComplete } = useGame();
  const [worldMenu, setWorldMenu] = useState(false);
  return (
    <>
      <AnimatePresence>{mobileNavOpen && <motion.button className="nav-scrim" aria-label="Закрыть меню" onClick={() => setMobileNavOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />}</AnimatePresence>
      <aside className={`sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
        <div className="sidebar__brand"><button onClick={() => navigate('home')} aria-label="TERRA Летопись — на главную"><Brand /></button><button className="icon-button sidebar__mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Закрыть меню"><X size={19} /></button></div>
        <div className="world-switcher">
          <button className="world-switcher__main" onClick={() => setWorldMenu(!worldMenu)} aria-expanded={worldMenu}>
            <span className="world-switcher__icon"><TreePine size={21} /></span>
            <span><small>ТВОЙ МИР</small><strong>Зелёная долина</strong></span>
            <ChevronDown size={15} className={worldMenu ? 'is-rotated' : ''} />
          </button>
          <AnimatePresence>{worldMenu && (
            <motion.div className="world-switcher__menu" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <div><span>Прогресс мира</span><strong>{progress.length} / {stages.length}</strong></div>
              <button onClick={() => { setWorldMenu(false); setModal({ type: 'reset-world' }); }}><RotateCcw size={14} /> Начать новый путь</button>
              <button onClick={() => { setWorldMenu(false); window.dispatchEvent(new Event('terra:replay-intro')); }}><Play size={14} /> Повторить вступление</button>
            </motion.div>
          )}</AnimatePresence>
        </div>
        <nav className="sidebar__nav" aria-label="Основная навигация">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-group__label">{group.label}</span>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <button key={item.id} className={`nav-item ${active ? 'is-active' : ''}`} onClick={() => navigate(item.id)} aria-current={active ? 'page' : undefined}>
                    <Icon size={18} strokeWidth={1.8} /><span>{item.label}</span>
                    {item.badge && <small>{allComplete ? <Check size={11} /> : currentStageIndex + 1}</small>}
                    {active && <motion.i layoutId="nav-active" transition={{ type: 'spring', stiffness: 450, damping: 34 }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar__guide">
          <PixelGuide size={46} />
          <div><span>Гид шепчет</span><p>«Даже у самой долгой ночи есть рассвет».</p></div>
        </div>
        <div className="sidebar__profile">
          <span className="profile-avatar">П</span>
          <div><strong>Путешественник</strong><small>Уровень пути · {currentStageIndex + 1}</small></div>
          <Sparkles size={16} />
        </div>
      </aside>
    </>
  );
}

function Topbar() {
  const { setSearchOpen, spoilerFree, setSpoilerFree, setMobileNavOpen, showToast, currentStageIndex } = useGame();
  return (
    <header className="topbar">
      <button className="icon-button topbar__menu" onClick={() => setMobileNavOpen(true)} aria-label="Открыть меню"><Menu size={21} /></button>
      <button className="topbar__mobile-brand" onClick={() => window.location.hash = '/home'}><Brand compact /></button>
      <button className="global-search" onClick={() => setSearchOpen(true)}>
        <Search size={18} /><span>Найти предмет, босса или историю…</span><kbd>CTRL K</kbd>
      </button>
      <div className="topbar__actions">
        <button
          className={`spoiler-toggle ${spoilerFree ? 'is-active' : ''}`} role="switch" aria-checked={spoilerFree}
          onClick={() => {
            setSpoilerFree(!spoilerFree);
            showToast(!spoilerFree ? 'Спойлеры снова скрыты.' : 'Будущие названия теперь видны. Этапы всё равно открываются по очереди.', 'neutral');
          }}
          title="Переключить режим без спойлеров"
        >
          {spoilerFree ? <EyeOff size={17} /> : <Eye size={17} />}<span>Без спойлеров</span><i><b /></i>
        </button>
        <span className="topbar__divider" />
        <div className="topbar__profile"><span className="profile-avatar">П</span><div><strong>Путник</strong><small>Глава {currentStageIndex + 1}</small></div></div>
      </div>
    </header>
  );
}

function Toasts() {
  const { toasts } = useGame();
  return (
    <div className="toasts" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div className={`toast toast--${toast.type}`} key={toast.id} initial={{ opacity: 0, x: 30, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 18 }} layout>
            <span>{toast.type === 'warning' ? <AlertTriangle size={18} /> : toast.type === 'neutral' ? <Info size={18} /> : <CheckCircle2 size={18} />}</span>
            <p>{toast.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function CurrentPage() {
  const { view } = useGame();
  switch (view) {
    case 'path': return <Path />;
    case 'resources': return <Resources />;
    case 'crafts': return <Crafts />;
    case 'obtain': return <Obtain />;
    case 'npcs': return <Npcs />;
    case 'stories': return <Stories />;
    case 'journal': return <Journal />;
    default: return <HomePage />;
  }
}

export default function App() {
  const { view, modal, searchOpen } = useGame();
  const [showIntro, setShowIntro] = useState(() => {
    try { return window.sessionStorage.getItem('terra-intro-seen') !== 'true'; } catch { return true; }
  });
  const closeIntro = useCallback(() => setShowIntro(false), []);

  useEffect(() => {
    const replay = () => setShowIntro(true);
    window.addEventListener('terra:replay-intro', replay);
    return () => window.removeEventListener('terra:replay-intro', replay);
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (!showIntro) useGameSearchEvent();
      }
    };
    const useGameSearchEvent = () => window.dispatchEvent(new Event('terra:open-search'));
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showIntro]);

  return (
    <>
      <div className="app-background" aria-hidden="true"><span /><span /><span /></div>
      <div className="app-shell">
        <Sidebar />
        <div className="app-main">
          <Topbar />
          <main className="content">
            <AnimatePresence mode="wait">
              <motion.div key={view} initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.24 }}>
                <CurrentPage />
              </motion.div>
            </AnimatePresence>
            <footer className="site-footer"><Brand compact /><span>Твой мир. Твои правила. Твоя история.</span><small>Неофициальный фанатский проект · Terraria © Re-Logic</small></footer>
          </main>
        </div>
      </div>
      <SearchShortcut />
      <AnimatePresence>{modal && <ModalRoot />}</AnimatePresence>
      <AnimatePresence>{searchOpen && <SearchPalette />}</AnimatePresence>
      <Toasts />
      <AnimatePresence>{showIntro && <Intro onDone={closeIntro} />}</AnimatePresence>
    </>
  );
}

function SearchShortcut() {
  const { setSearchOpen, modal } = useGame();
  useEffect(() => {
    const open = () => { if (!modal) setSearchOpen(true); };
    window.addEventListener('terra:open-search', open);
    return () => window.removeEventListener('terra:open-search', open);
  }, [modal, setSearchOpen]);
  return null;
}
