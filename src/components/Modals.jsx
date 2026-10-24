import { useCallback, useState } from 'react';
import {
  ArrowRight, Backpack, BookOpen, Check, CheckCircle2, ChevronRight, Clock3,
  Dices, Feather, Heart, Lightbulb, MapPin, Plus, Sparkles, Trash2, Trophy,
} from 'lucide-react';
import { useGame } from '../context';
import { resourceById, stages, worldTasks } from '../data';
import { CheckLine, ItemIcon, Modal, PixelGuide } from './UI';

function ModalTitle({ eyebrow, title, children }) {
  return <div className="modal-title">{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{children}</div>;
}

function RecipeModal({ item }) {
  const { inventory, navigate, setModal, favorites, toggleFavorite } = useGame();
  const favorite = favorites.includes(item.id);
  return (
    <Modal onClose={() => setModal(null)} label={`Рецепт: ${item.name}`} className="item-modal">
      <div className="item-modal__hero" style={{ '--item-accent': item.color }}>
        <ItemIcon icon={item.icon} color={item.color} size="xl" />
        <div><span className="eyebrow">{item.category} · РЕЦЕПТ</span><h2>{item.name}{item.output > 1 && <small> ×{item.output}</small>}</h2></div>
        <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(item.id)} aria-label="Избранное"><Heart size={19} fill={favorite ? 'currentColor' : 'none'} /></button>
      </div>
      <p className="item-modal__description">{item.description}</p>
      <div className="modal-section"><span className="eyebrow">ПОНАДОБИТСЯ</span><div className="modal-ingredients">
        {Object.entries(item.ingredients).map(([id, amount]) => {
          const resource = resourceById[id];
          const have = inventory[id] || 0;
          return <div key={id}><ItemIcon icon={resource.icon} color={resource.color} /><span><strong>{resource.name}</strong><small className={have >= amount ? 'has-enough' : 'not-enough'}>В рюкзаке: {have}</small></span><b>×{amount}</b></div>;
        })}
      </div></div>
      <div className="station-note"><ItemIcon icon="workbench" color="#d5f96f" size="sm" /><div><small>ГДЕ СОЗДАТЬ</small><strong>{item.station}</strong></div></div>
      <div className="guide-practical-hint"><span><Lightbulb size={18} /></span><div><small>МАЛЕНЬКИЙ СОВЕТ</small><p>{item.tip}</p></div></div>
      <div className="modal-actions"><button className="button button--soft" onClick={() => { setModal(null); navigate('resources'); }}><Backpack size={17} /> Проверить ресурсы</button><button className="button button--primary" onClick={() => setModal(null)}>Понятно <Check size={17} /></button></div>
    </Modal>
  );
}

function ObtainModal({ item }) {
  const { setModal, favorites, toggleFavorite } = useGame();
  const favorite = favorites.includes(item.id);
  return (
    <Modal onClose={() => setModal(null)} label={`Как получить: ${item.name}`} className="item-modal">
      <div className="item-modal__hero" style={{ '--item-accent': item.color }}>
        <ItemIcon icon={item.icon} color={item.color} size="xl" />
        <div><span className="eyebrow">{item.category} · ГАЙД ПО ПОИСКУ</span><h2>{item.name}</h2></div>
        <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(item.id)} aria-label="Избранное"><Heart size={19} fill={favorite ? 'currentColor' : 'none'} /></button>
      </div>
      <p className="item-modal__description">{item.description}</p>
      <div className="obtain-route"><MapPin size={20} /><div><small>МЕСТО ПОИСКА</small><strong>{item.source}</strong><span>{item.biome} · {item.chance}</span></div></div>
      <div className="modal-section"><span className="eyebrow">МАРШРУТ</span><ol className="route-steps">{item.steps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol></div>
      <div className="guide-practical-hint"><span><Lightbulb size={18} /></span><div><small>СОВЕТ ГИДА</small><p>{item.tip}</p></div></div>
      <div className="modal-actions"><button className="button button--primary button--full" onClick={() => setModal({ type: 'journal-new', prefill: { title: `Найти: ${item.name}`, text: `Маршрут: ${item.source}.\n\nСовет: ${item.tip}`, tag: 'Находка' } })}><Plus size={17} /> Сохранить поиск в дневник</button></div>
    </Modal>
  );
}

function CompleteStageModal({ stage }) {
  const { setModal, completeStage } = useGame();
  return (
    <Modal onClose={() => setModal(null)} label="Подтверждение прохождения" className="confirm-modal">
      <div className="confirm-modal__emblem"><Trophy size={32} /></div>
      <ModalTitle eyebrow={`ГЛАВА ${stage.roman} · ПОБЕДА`} title="Записать в летопись?" />
      <p>Подтверди, что цель этапа выполнена. Следующая карточка откроется сразу после этого.</p>
      <div className="confirm-objective"><ItemIcon icon={stage.icon} color={stage.color} /><div><small>{stage.boss}</small><strong>{stage.objective}</strong></div></div>
      <div className="confirm-unlock"><Sparkles size={16} /><span>Новая глава и её история станут доступны</span></div>
      <div className="modal-actions"><button className="button button--ghost" onClick={() => setModal(null)}>Ещё не сейчас</button><button className="button button--primary" onClick={() => completeStage(stage.id)}><CheckCircle2 size={18} /> Да, этап пройден</button></div>
    </Modal>
  );
}

function ResetWorldModal() {
  const { setModal, resetProgress, progress } = useGame();
  return (
    <Modal onClose={() => setModal(null)} label="Начать новый мир" className="confirm-modal">
      <div className="confirm-modal__emblem confirm-modal__emblem--muted"><MapPin size={30} /></div>
      <ModalTitle eyebrow="НОВОЕ ПРИКЛЮЧЕНИЕ" title="Начать путь заново?" />
      <p>Все отметки о пройденных главах ({progress.length}) будут сброшены. Рюкзак и записи дневника останутся.</p>
      <div className="modal-actions"><button className="button button--ghost" onClick={() => setModal(null)}>Остаться</button><button className="button button--danger" onClick={resetProgress}>Сбросить прогресс</button></div>
    </Modal>
  );
}

function DeleteEntryModal({ entry }) {
  const { setModal, deleteJournalEntry } = useGame();
  return (
    <Modal onClose={() => setModal(null)} label="Удалить страницу" className="confirm-modal">
      <div className="confirm-modal__emblem confirm-modal__emblem--danger"><Trash2 size={28} /></div>
      <ModalTitle eyebrow="ДНЕВНИК" title="Удалить эту страницу?" />
      <p>Запись «{entry.title}» исчезнет из летописи. Это действие нельзя отменить.</p>
      <div className="modal-actions"><button className="button button--ghost" onClick={() => setModal(null)}>Оставить</button><button className="button button--danger" onClick={() => deleteJournalEntry(entry.id)}>Удалить страницу</button></div>
    </Modal>
  );
}

function JournalForm({ prefill = {} }) {
  const { journal, addJournalEntry, setModal } = useGame();
  const maxDay = journal.reduce((max, entry) => Math.max(max, Number(entry.day) || 0), 0);
  const [form, setForm] = useState({
    day: prefill.day || maxDay || 1,
    title: prefill.title || '',
    tag: prefill.tag || 'Приключение',
    text: prefill.text || '',
  });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    const date = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date());
    addJournalEntry({ ...form, day: Number(form.day), date, favorite: false });
  };
  return (
    <Modal onClose={() => setModal(null)} label="Новая страница дневника" className="journal-form-modal">
      <div className="journal-form-modal__heading"><span><Feather size={24} /></span><ModalTitle eyebrow="НОВАЯ СТРАНИЦА" title="Что запомнится этот день?" /></div>
      <form onSubmit={submit}>
        <div className="form-row">
          <label><span>День в мире</span><input type="number" min="1" max="99999" required value={form.day} onChange={(event) => update('day', event.target.value)} /></label>
          <label className="form-tag-field"><span>Раздел</span><select value={form.tag} onChange={(event) => update('tag', event.target.value)}><option>Приключение</option><option>Босс</option><option>Находка</option><option>Строительство</option><option>История</option><option>Задание</option><option>Начало</option></select></label>
        </div>
        <label><span>Заголовок</span><input autoFocus required maxLength="70" placeholder="Например: Ночь, когда всё изменилось" value={form.title} onChange={(event) => update('title', event.target.value)} /></label>
        <label><span>Твоя история</span><textarea required maxLength="1000" rows="6" placeholder="Что произошло? Что ты нашёл, построил или понял?" value={form.text} onChange={(event) => update('text', event.target.value)} /></label>
        <div className="form-footer"><small>{form.text.length}/1000 · сохранится в этом браузере</small><button className="button button--primary" type="submit"><Feather size={17} /> Добавить в летопись</button></div>
      </form>
    </Modal>
  );
}

function TaskModal() {
  const { activeTask, setActiveTask, currentStageIndex, setModal } = useGame();
  if (!activeTask) return null;
  const another = () => {
    const available = worldTasks.filter((task) => task.minStage <= currentStageIndex && task.id !== activeTask.id);
    setActiveTask(available[Math.floor(Math.random() * available.length)]);
  };
  return (
    <Modal onClose={() => setModal(null)} label="Случайное задание" className="task-modal">
      <div className="task-modal__visual"><span className="task-modal__spark"><Sparkles size={24} /></span><ItemIcon icon={activeTask.icon} color="#d5f96f" size="xl" /><span className="eyebrow">ГЕНЕРАТОР ПРИКЛЮЧЕНИЙ</span></div>
      <ModalTitle eyebrow="ЕСЛИ НЕ ЗНАЕШЬ, ЧЕМ ЗАНЯТЬСЯ" title={activeTask.title}><p>{activeTask.text}</p></ModalTitle>
      <div className="task-modal__time"><Clock3 size={16} /> Примерно {activeTask.time}</div>
      <button className="button button--primary button--full" onClick={() => setModal({ type: 'journal-new', prefill: { title: `Задание: ${activeTask.title}`, text: activeTask.text, tag: 'Задание' } })}><Plus size={18} /> Добавить задание в дневник</button>
      <button className="task-modal__another" onClick={another}><Dices size={16} /> Дать другое задание</button>
    </Modal>
  );
}

export default function ModalRoot() {
  const { modal, setModal } = useGame();
  const close = useCallback(() => setModal(null), [setModal]);
  if (!modal) return null;
  switch (modal.type) {
    case 'recipe': return <RecipeModal item={modal.item} />;
    case 'obtain': return <ObtainModal item={modal.item} />;
    case 'complete-stage': return <CompleteStageModal stage={modal.stage} />;
    case 'reset-world': return <ResetWorldModal />;
    case 'delete-entry': return <DeleteEntryModal entry={modal.entry} />;
    case 'journal-new': return <JournalForm prefill={modal.prefill} />;
    case 'task': return <TaskModal />;
    default: return <Modal onClose={close}><ModalTitle title="Здесь пока тихо" /></Modal>;
  }
}
