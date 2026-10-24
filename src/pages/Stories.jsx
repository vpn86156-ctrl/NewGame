import { useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, EyeOff, Feather,
  Lightbulb, LockKeyhole, Plus, Quote, Sparkles,
} from 'lucide-react';
import { useGame } from '../context';
import { guideStories, stages } from '../data';
import { ItemIcon, PageHeader, PixelGuide, Reveal } from '../components/UI';

export default function Stories() {
  const { currentStageIndex, spoilerFree, setModal, showToast } = useGame();
  const [selectedId, setSelectedId] = useState(guideStories[currentStageIndex]?.id || guideStories[0].id);
  const selectedIndex = Math.max(0, guideStories.findIndex((story) => story.id === selectedId));
  const story = guideStories[selectedIndex];
  const unlocked = guideStories.filter((item) => item.stage <= currentStageIndex);

  useEffect(() => {
    if (selectedIndex > currentStageIndex) setSelectedId(guideStories[currentStageIndex].id);
  }, [currentStageIndex, selectedIndex]);

  const chooseStory = (item) => {
    if (item.stage > currentStageIndex) {
      showToast('Эта история появится после открытия соответствующей главы.', 'warning');
      return;
    }
    setSelectedId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const move = (direction) => {
    const index = unlocked.findIndex((item) => item.id === story.id);
    setSelectedId(unlocked[(index + direction + unlocked.length) % unlocked.length].id);
  };

  return (
    <div className="stories-page page-stack">
      <PageHeader
        eyebrow="СЮЖЕТ TERRARIA · ЗАПИСИ У КОСТРА"
        title="Истории, а не инструкции."
        description="Гид рассказывает о мире так, будто сидит рядом. А полезная подсказка всегда спрятана между строк."
      >
        <div className="stories-progress"><BookOpen size={22} /><div><strong>{unlocked.length} / {guideStories.length}</strong><span>записей открыто</span></div></div>
      </PageHeader>

      <Reveal className="story-feature" key={story.id}>
        <div className="story-feature__stars" aria-hidden="true" />
        <div className="story-feature__aside">
          <span className="eyebrow">ГЛАВА {stages[story.stage].roman}</span>
          <div className="story-feature__portrait"><span className="story-feature__glow" /><PixelGuide size={132} /><i>ГИД</i></div>
          <span className="story-feature__chapter-number">Запись {String(story.stage + 1).padStart(2, '0')}</span>
        </div>
        <article className="story-feature__article">
          <div className="story-feature__meta"><span><Feather size={14} /> {story.chapter}</span><span>{stages[story.stage].era}</span></div>
          <h2>{story.title}</h2>
          <Quote className="story-feature__quote-icon" size={30} />
          <blockquote>{story.quote}</blockquote>
          <p>{story.text}</p>
          <div className="guide-practical-hint"><span><Lightbulb size={19} /></span><div><small>ПОДСКАЗКА МЕЖДУ СТРОК</small><p>{story.hint}</p></div></div>
          <div className="story-feature__actions">
            <button className="button button--soft" onClick={() => setModal({ type: 'journal-new', prefill: { title: `После главы «${stages[story.stage].title}»`, tag: 'История' } })}><Plus size={17} /> Записать свою мысль</button>
            <div><button className="icon-button" onClick={() => move(-1)} aria-label="Предыдущая история"><ArrowLeft size={18} /></button><button className="icon-button" onClick={() => move(1)} aria-label="Следующая история"><ArrowRight size={18} /></button></div>
          </div>
        </article>
      </Reveal>

      <Reveal className="story-collection-heading">
        <div><span className="eyebrow">ЛЕТОПИСЬ ГИДА</span><h2>Все записи</h2></div>
        {spoilerFree && <span className="soft-badge"><EyeOff size={14} /> Будущие истории скрыты</span>}
      </Reveal>

      <div className="story-chapter-grid">
        {guideStories.map((item, index) => {
          const locked = item.stage > currentStageIndex;
          const hidden = locked && spoilerFree;
          const selected = item.id === story.id;
          return (
            <Reveal key={item.id} delay={Math.min(index * 0.04, 0.28)}>
              <button
                className={`story-chapter-card ${locked ? 'is-locked' : ''} ${selected ? 'is-selected' : ''}`}
                onClick={() => chooseStory(item)} style={{ '--story-color': stages[item.stage].color }}
              >
                <span className="story-chapter-card__number">{hidden ? '??' : String(index + 1).padStart(2, '0')}</span>
                <div className="story-chapter-card__icon"><ItemIcon icon={hidden ? 'shield' : stages[item.stage].icon} color={hidden ? '#64716c' : stages[item.stage].color} /></div>
                <div className="story-chapter-card__copy">
                  <small>{hidden ? 'ЗАПИСЬ СКРЫТА' : item.chapter}</small>
                  <h3>{hidden ? 'Ещё не время…' : item.title}</h3>
                  <span>{locked ? <><LockKeyhole size={12} /> Открой главу {stages[item.stage].roman}</> : selected ? <><Sparkles size={12} /> Сейчас читаешь</> : <><Check size={12} /> Доступно</>}</span>
                </div>
                <ChevronRight size={17} />
              </button>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
