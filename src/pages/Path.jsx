import { useEffect, useState } from 'react';
import {
  ArrowRight, Check, CheckCircle2, ChevronRight, EyeOff, Flag, LockKeyhole,
  Map, RotateCcw, ShieldCheck, Sparkles, Trophy,
} from 'lucide-react';
import { useGame } from '../context';
import { guideStories, stages } from '../data';
import { AnimatedNumber, CheckLine, ItemIcon, PageHeader, PixelGuide, ProgressRing, Reveal } from '../components/UI';
import StageIcon from '../components/StageIcon';

export default function Path() {
  const { progress, currentStageIndex, currentStage, allComplete, spoilerFree, setModal, showToast, navigate } = useGame();
  const [selectedId, setSelectedId] = useState(currentStage.id);
  const [blockedId, setBlockedId] = useState(null);
  const selectedIndex = Math.max(0, stages.findIndex((stage) => stage.id === selectedId));
  const selected = stages[selectedIndex];
  const selectedComplete = progress.includes(selected.id);
  const selectedCurrent = selectedIndex === currentStageIndex && !allComplete;
  const story = guideStories[selectedIndex];
  const percent = Math.round((progress.length / stages.length) * 100);

  useEffect(() => {
    setSelectedId(currentStage.id);
  }, [currentStage.id]);

  const selectStage = (stage, index) => {
    if (index > currentStageIndex) {
      setBlockedId(stage.id);
      window.setTimeout(() => setBlockedId(null), 450);
      showToast(spoilerFree ? 'Эта глава скрыта. Заверши текущий этап, чтобы открыть её.' : `Сначала заверши этап «${currentStage.title}».`, 'warning');
      return;
    }
    setSelectedId(stage.id);
    if (window.innerWidth < 900) {
      window.setTimeout(() => document.getElementById('stage-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  };

  return (
    <div className="path-page page-stack">
      <PageHeader
        eyebrow="КАРТА ПРИКЛЮЧЕНИЯ"
        title={allComplete ? 'Летопись завершена.' : 'Твой путь. Одна глава за другой.'}
        description="Исследуй мир в своём темпе. Следующая карточка откроется после того, как ты отметишь победу в текущей."
      >
        <div className="path-header-progress">
          <ProgressRing value={percent} size={76} stroke={6}><strong>{progress.length}/{stages.length}</strong><small>ГЛАВ</small></ProgressRing>
          <button className="button button--ghost button--small" onClick={() => setModal({ type: 'reset-world' })}><RotateCcw size={15} /> Новый мир</button>
        </div>
      </PageHeader>

      {spoilerFree && (
        <Reveal className="spoiler-banner" delay={0.05}>
          <span className="spoiler-banner__icon"><EyeOff size={20} /></span>
          <div><strong>Режим без спойлеров включён</strong><p>Будущие главы скрыты. Ты увидишь только то, до чего уже дошёл.</p></div>
          <span className="spoiler-banner__badge"><ShieldCheck size={14} /> СЮЖЕТ ЗАЩИЩЁН</span>
        </Reveal>
      )}

      <Reveal className="path-stats" delay={0.08}>
        <div><span className="path-stats__icon"><Flag size={18} /></span><p>Пройдено глав<strong><AnimatedNumber value={progress.length} /></strong></p></div>
        <i />
        <div><span className="path-stats__icon"><Map size={18} /></span><p>{allComplete ? 'Статус мира' : 'Текущая глава'}<strong>{allComplete ? 'Свободное приключение' : currentStage.title}</strong></p></div>
        <i />
        <div><span className="path-stats__icon"><Trophy size={18} /></span><p>{allComplete ? 'Лунный лорд' : 'До финальной главы'}<strong>{allComplete ? 'Повержен' : `${stages.length - currentStageIndex - 1} этапов`}</strong></p></div>
      </Reveal>

      <div className="path-layout">
        <div className="stage-timeline" style={{ '--path-ratio': allComplete ? 1 : currentStageIndex / (stages.length - 1) }}>
          {stages.map((stage, index) => {
            const complete = progress.includes(stage.id);
            const current = index === currentStageIndex && !allComplete;
            const locked = index > currentStageIndex;
            const hidden = locked && spoilerFree;
            const active = selectedId === stage.id && !locked;
            return (
              <Reveal key={stage.id} delay={Math.min(index * 0.035, 0.25)} className="stage-timeline__wrap">
                <span className={`stage-timeline__node ${complete ? 'is-complete' : current ? 'is-current' : ''}`}>
                  {complete ? <Check size={12} /> : locked ? <LockKeyhole size={11} /> : <span />}
                </span>
                <button
                  className={`timeline-card ${complete ? 'is-complete' : ''} ${current ? 'is-current' : ''} ${locked ? 'is-locked' : ''} ${active ? 'is-selected' : ''} ${blockedId === stage.id ? 'is-blocked' : ''}`}
                  onClick={() => selectStage(stage, index)} style={{ '--stage-color': stage.color }} aria-current={active ? 'step' : undefined}
                >
                  <span className="timeline-card__number">{hidden ? '??' : stage.roman}</span>
                  {hidden ? <ItemIcon icon="shield" color="#64716c" /> : <StageIcon stageId={stage.id} color={stage.color} />}
                  <span className="timeline-card__copy">
                    <small>{hidden ? 'НЕИЗВЕСТНАЯ ГЛАВА' : stage.era}</small>
                    <strong>{hidden ? 'Продолжай путь…' : stage.title}</strong>
                    <span>{complete ? 'Глава пройдена' : current ? stage.objective : locked ? 'Заверши предыдущую главу' : stage.objective}</span>
                  </span>
                  <ChevronRight className="timeline-card__chevron" size={18} />
                </button>
              </Reveal>
            );
          })}
          <div className="timeline-end"><Sparkles size={15} /><span>И продолжение — за тобой</span></div>
        </div>

        <Reveal className="stage-detail" id="stage-details" key={selected.id}>
          <div className="stage-detail__ambient" style={{ '--stage-color': selected.color }} />
          <div className="stage-detail__header">
            <div className="stage-detail__identity">
              <StageIcon stageId={selected.id} color={selected.color} size="xl" />
              <div><span className="eyebrow">ГЛАВА {selected.roman} · {selected.era}</span><h2>{selected.title}</h2></div>
            </div>
            <span className={`stage-status ${selectedComplete ? 'stage-status--done' : 'stage-status--current'}`}>
              {selectedComplete ? <><Check size={12} /> ПРОЙДЕНО</> : 'ТЕКУЩИЙ ЭТАП'}
            </span>
          </div>
          <p className="stage-detail__lead">{selected.description}</p>

          <div className="boss-objective" style={{ '--stage-color': selected.color }}>
            <span className="boss-objective__icon"><StageIcon stageId={selected.id} color={selected.color} size="lg" /></span>
            <div><small>ЦЕЛЬ ЭТАПА</small><strong>{selected.boss}</strong><span>{selected.objective}</span></div>
            <ItemIcon icon="trophy" color={selected.color} size="sm" />
          </div>

          <div className="stage-detail__section">
            <h3><CheckCircle2 size={18} /> Что нужно сделать</h3>
            <ul className="objective-list">
              {selected.tasks.map((task) => <CheckLine key={task} checked={selectedComplete}>{task}</CheckLine>)}
            </ul>
          </div>

          <div className="stage-reward"><Sparkles size={17} /><div><small>ЧТО ОТКРОЕТСЯ</small><p>{selected.reward}</p></div></div>

          {!selectedComplete && selectedCurrent && (
            <button className="button button--primary button--full stage-complete-button" onClick={() => setModal({ type: 'complete-stage', stage: selected })}>
              <CheckCircle2 size={19} /> Я прошёл этот этап <ArrowRight size={18} />
            </button>
          )}
          {selectedComplete && <div className="stage-completed-note"><CheckCircle2 size={18} /> Победа записана в летопись</div>}

          {story && (
            <div className="stage-guide-note">
              <PixelGuide size={54} />
              <div><span>{story.chapter}</span><p>{story.quote}</p></div>
              <button className="icon-button" onClick={() => navigate('stories')} aria-label="Открыть истории Гида"><ArrowRight size={17} /></button>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
