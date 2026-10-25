import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initialJournal, stages } from './data';
import { createInitialInventory, migrateInventory } from './gameData';
import { useLocalStorage } from './hooks';

const GameContext = createContext(null);
const validViews = ['home', 'path', 'resources', 'crafts', 'obtain', 'npcs', 'stories', 'journal'];
const initialProgress = ['awakening', 'king-slime'];

function getInitialView() {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  return validViews.includes(hash) ? hash : 'home';
}

export function GameProvider({ children }) {
  const [view, setView] = useState(getInitialView);
  const [progress, setProgress] = useLocalStorage('terra-world-progress-v1', initialProgress);
  const [spoilerFree, setSpoilerFree] = useLocalStorage('terra-spoiler-free-v1', true);
  const [inventory, setInventory] = useLocalStorage('terra-inventory-v1', createInitialInventory);
  const [journal, setJournal] = useLocalStorage('terra-journal-v1', initialJournal);
  const [favorites, setFavorites] = useLocalStorage('terra-favorite-recipes-v1', []);
  const [challengeAccepted, setChallengeAccepted] = useLocalStorage('terra-challenge-v1', false);
  const [modal, setModal] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    const onHashChange = () => setView(getInitialView());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    setInventory((current) => migrateInventory(current));
  }, [setInventory]);

  const currentStageIndex = useMemo(() => {
    const firstOpen = stages.findIndex((stage) => !progress.includes(stage.id));
    return firstOpen === -1 ? stages.length - 1 : firstOpen;
  }, [progress]);

  const allComplete = progress.length >= stages.length;
  const currentStage = stages[currentStageIndex];

  const showToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3600);
  }, []);

  const navigate = useCallback((nextView) => {
    if (!validViews.includes(nextView)) return;
    setView(nextView);
    window.location.hash = `/${nextView}`;
    setMobileNavOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const completeStage = useCallback((stageId) => {
    const index = stages.findIndex((stage) => stage.id === stageId);
    if (index < 0 || progress.includes(stageId)) return;
    const previousIncomplete = stages.findIndex((stage) => !progress.includes(stage.id));
    if (index !== previousIncomplete) {
      showToast('Сначала заверши предыдущий этап.', 'warning');
      return;
    }
    setProgress((items) => [...items, stageId]);
    setModal(null);
    const next = stages[index + 1];
    showToast(next ? `Глава пройдена. Открыт этап «${next.title}»!` : 'Лунный лорд повержен. Летопись завершена!');
  }, [progress, setProgress, showToast]);

  const resetProgress = useCallback(() => {
    setProgress([]);
    setModal(null);
    showToast('Новый мир создан. Путь начался с первого рассвета.');
  }, [setProgress, showToast]);

  const updateResource = useCallback((id, amount) => {
    setInventory((items) => ({ ...items, [id]: Math.max(0, Math.min(9999, amount)) }));
  }, [setInventory]);

  const toggleFavorite = useCallback((id) => {
    setFavorites((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  }, [setFavorites]);

  const addJournalEntry = useCallback((entry) => {
    setJournal((items) => [{ ...entry, id: `entry-${Date.now()}` }, ...items]);
    setModal(null);
    showToast('Новая страница добавлена в летопись.');
  }, [setJournal, showToast]);

  const deleteJournalEntry = useCallback((id) => {
    setJournal((items) => items.filter((entry) => entry.id !== id));
    setModal(null);
    showToast('Страница удалена из дневника.', 'neutral');
  }, [setJournal, showToast]);

  const toggleJournalFavorite = useCallback((id) => {
    setJournal((items) => items.map((entry) => entry.id === id ? { ...entry, favorite: !entry.favorite } : entry));
  }, [setJournal]);

  const restoreSave = useCallback((data) => {
    setProgress(data.progress);
    setSpoilerFree(data.spoilerFree);
    setInventory(migrateInventory(data.inventory));
    setJournal(data.journal);
    setFavorites(data.favorites);
    setChallengeAccepted(data.challengeAccepted);
    setModal(null);
    showToast('Сохранение восстановлено: рюкзак, прогресс и дневник на месте.');
  }, [setChallengeAccepted, setFavorites, setInventory, setJournal, setProgress, setSpoilerFree, showToast]);

  const value = useMemo(() => ({
    view, navigate, progress, spoilerFree, setSpoilerFree, inventory, setInventory, updateResource,
    journal, setJournal, addJournalEntry, deleteJournalEntry, toggleJournalFavorite, restoreSave,
    favorites, toggleFavorite, challengeAccepted, setChallengeAccepted,
    currentStageIndex, currentStage, allComplete, completeStage, resetProgress,
    modal, setModal, searchOpen, setSearchOpen, toasts, showToast,
    mobileNavOpen, setMobileNavOpen, activeTask, setActiveTask,
  }), [
    view, navigate, progress, spoilerFree, setSpoilerFree, inventory, setInventory, updateResource,
    journal, setJournal, addJournalEntry, deleteJournalEntry, toggleJournalFavorite, restoreSave,
    favorites, toggleFavorite, challengeAccepted, setChallengeAccepted,
    currentStageIndex, currentStage, allComplete, completeStage, resetProgress,
    modal, searchOpen, toasts, showToast, mobileNavOpen, activeTask,
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used inside GameProvider');
  return context;
}
