import { useMemo, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, BookOpen, Check, ChevronRight, Clock3, Dices, Feather,
  Hammer, Heart, LockKeyhole, Map, PackageOpen, Plus, Search, Sparkles,
} from 'lucide-react';
import { useGame } from '../context';
import { guideStories, stages, worldTasks } from '../data';
import { getCraftableRecipes, getItemName } from '../gameData';
import { InlineLink, ItemIcon, PixelGuide, ProgressRing, Reveal, SectionHeading } from '../components/UI';
import TerrariaIcon from '../components/TerrariaIcon';
import StageIcon from '../components/StageIcon';

const quickLinks = [
  { view: 'crafts', icon: 'workbench', color: '#d5f96f', label: 'Все крафты', text: 'Рецепты и станции', meta: '3 655 рецептов' },
  { view: 'obtain', icon: 'compass', color: '#82d5f8', label: 'Как получить', text: 'Крафт, дроп и магазины', meta: '6 186 предметов' },
  { view: 'stories', icon: 'book', color: '#c4a7ff', label: 'Сюжет Terraria', text: 'Истории без спойлеров', meta: '11 глав' },
];

export default function Home() {
  const {
    navigate, currentStage, currentStageIndex, progress, spoilerFree, inventory, allComplete,
    setModal, setActiveTask, journal, challengeAccepted, setChallengeAccepted, showToast,
  } = useGame();
  const availableStories = useMemo(() => guideStories.filter((story) => story.stage <= currentStageIndex), [currentStageIndex]);
  const [storyId, setStoryId] = useState(availableStories.at(-1)?.id || guideStories[0].id);
  const story = availableStories.find((item) => item.id === storyId) || availableStories.at(-1);
  const completedCount = progress.length;
  const percent = Math.round((completedCount / stages.length) * 100);
  const craftable = getCraftableRecipes(inventory, currentStageIndex, spoilerFree);
  const visibleStages = allComplete ? stages.slice(-3) : stages.slice(Math.max(0, currentStageIndex - 1), Math.max(0, currentStageIndex - 1) + 3);

  const nextStory = () => {
    const index = availableStories.findIndex((item) => item.id === story.id);
    setStoryId(availableStories[(index + 1) % availableStories.length].id);
  };

  const randomTask = () => {
    const available = worldTasks.filter((task) => task.minStage <= currentStageIndex);
    setActiveTask(available[Math.floor(Math.random() * available.length)]);
    setModal({ type: 'task' });
  };

  const openStage = (stage, index) => {
    if (index > currentStageIndex) {
      showToast(`Сначала заверши этап «${currentStage.title}».`, 'warning');
      return;
    }
    navigate('path');
  };

  return (
    <div className="home-page page-stack">
      <Reveal className="home-welcome">
        <div>
          <span className="eyebrow"><span className="status-dot" /> МИР СОХРАНЁН · ОБЫЧНЫЙ РЕЖИМ</span>
          <h1>С возвращением,<br /><em>путешественник.</em></h1>
          <p>Гид оставил новую запись. А твой мир — ещё несколько тайн.</p>
        </div>
        <button className="button button--ghost random-task-button" onClick={randomTask}>
          <Dices size={19} /><span>Не знаю, чем заняться</span><Sparkles size={15} />
        </button>
      </Reveal>

      <section className="home-hero-grid">
        <Reveal className="world-hero" delay={0.06}>
          <img className="world-hero__image" src="images/terraria-night-hero.webp" alt="Ночной лес и дом путешественника" />
          <div className="world-hero__shade" />
          <div className="world-hero__light" aria-hidden="true" />
          <div className="world-hero__top">
            <span className="glass-label"><Map size={14} /> ЗЕЛЁНАЯ ДОЛИНА</span>
            <span className="glass-label glass-label--small">ДЕНЬ {8 + completedCount * 2}</span>
          </div>
          <div className="world-hero__content">
            <span className="eyebrow eyebrow--light">{allComplete ? 'ЛЕТОПИСЬ ЗАВЕРШЕНА · НОВЫЕ ИСТОРИИ' : `ГЛАВА ${currentStage.roman} · ТВОЙ СЛЕДУЮЩИЙ ШАГ`}</span>
            <h2>{allComplete ? 'Мир снова зовёт.' : currentStage.title}</h2>
            <p>{allComplete ? 'Лунный лорд повержен. Но строительство, коллекции и новые приключения только начинаются.' : currentStage.subtitle}</p>
            <button className="button button--primary" onClick={() => navigate('path')}>
              {allComplete ? 'Открыть летопись' : 'Продолжить путь'} <ArrowRight size={18} />
            </button>
          </div>
          <div className="world-hero__progress">
            <ProgressRing value={percent} size={78} stroke={6}>
              <strong>{percent}%</strong><small>МИРА</small>
            </ProgressRing>
          </div>
          {!allComplete && <button type="button" className="world-hero__encounter" onClick={() => navigate('path')} aria-label={`Открыть текущую главу: ${currentStage.boss}`}>
            <span className="world-hero__encounter-icon"><StageIcon stageId={currentStage.id} color={currentStage.color} size="lg" /></span>
            <span><small>{currentStage.id === 'awakening' ? 'ПЕРВАЯ ЦЕЛЬ' : 'ЦЕЛЬ ГЛАВЫ'}</small><strong>{currentStage.boss}</strong></span>
          </button>}
        </Reveal>

        <Reveal className="guide-card" delay={0.14}>
          <div className="guide-card__top">
            <span className="eyebrow"><Feather size={13} /> ИСТОРИЯ ГИДА</span>
            <span className="guide-card__number">#{String(story.stage + 1).padStart(2, '0')}</span>
          </div>
          <div className="guide-card__portrait">
            <div className="guide-card__halo" />
            <PixelGuide size={96} />
            <span><i /> Гид · у костра</span>
          </div>
          <div className="guide-card__story" key={story.id}>
            <span className="guide-card__chapter">{story.chapter}</span>
            <h3>{story.title}</h3>
            <blockquote>{story.quote}</blockquote>
          </div>
          <div className="guide-card__actions">
            <button className="inline-link" onClick={() => navigate('stories')}>Читать историю <ArrowRight size={15} /></button>
            <button className="icon-button" onClick={nextStory} aria-label="Другая история" title="Другая история"><Dices size={17} /></button>
          </div>
        </Reveal>
      </section>

      <section className="quick-links" aria-label="Быстрые разделы">
        {quickLinks.map((link, index) => (
          <Reveal key={link.view} delay={index * 0.07}>
            <button className="quick-link-card" onClick={() => navigate(link.view)} style={{ '--accent': link.color }}>
              <ItemIcon icon={link.icon} color={link.color} size="lg" />
              <span className="quick-link-card__copy">
                <strong>{link.label}</strong><span>{link.text}</span>
              </span>
              <span className="quick-link-card__meta">{link.meta}</span>
              <span className="quick-link-card__arrow"><ArrowUpRight size={19} /></span>
            </button>
          </Reveal>
        ))}
      </section>

      <section>
        <Reveal>
          <SectionHeading
            eyebrow="ПОСЛЕДОВАТЕЛЬНОЕ ПРОХОЖДЕНИЕ"
            title="Путь твоего мира"
            description="Новая глава откроется только после предыдущей."
            action={<InlineLink onClick={() => navigate('path')}>Весь путь</InlineLink>}
          />
        </Reveal>
        <div className="stage-preview-grid">
          {visibleStages.map((stage, mapIndex) => {
            const index = stages.findIndex((item) => item.id === stage.id);
            const complete = progress.includes(stage.id);
            const current = index === currentStageIndex;
            const locked = index > currentStageIndex;
            const hidden = locked && spoilerFree;
            return (
              <Reveal key={stage.id} delay={mapIndex * 0.08}>
                <button
                  className={`stage-preview-card ${complete ? 'is-complete' : ''} ${current ? 'is-current' : ''} ${locked ? 'is-locked' : ''}`}
                  onClick={() => openStage(stage, index)} style={{ '--stage-color': stage.color }}
                >
                  <div className="stage-preview-card__line"><span /></div>
                  <div className="stage-preview-card__top">
                    <span className="stage-preview-card__roman">{hidden ? '??' : stage.roman}</span>
                    {hidden ? <ItemIcon icon="shield" color="#64716c" /> : <StageIcon stageId={stage.id} color={stage.color} />}
                    <span className={`stage-status ${complete ? 'stage-status--done' : current ? 'stage-status--current' : ''}`}>
                      {complete ? <><Check size={12} /> ПРОЙДЕНО</> : current ? 'ТЕКУЩИЙ' : <><LockKeyhole size={11} /> ЗАКРЫТО</>}
                    </span>
                  </div>
                  <h3>{hidden ? 'Неизвестная глава' : stage.title}</h3>
                  <p>{hidden ? 'Секреты этого этапа пока скрыты.' : stage.subtitle}</p>
                  <div className="stage-preview-card__bottom">
                    <span>{hidden ? '???' : stage.boss}</span><ChevronRight size={17} />
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="home-tools-grid">
        <Reveal className="resource-promo">
          <div className="resource-promo__head">
            <div><span className="eyebrow">УМНЫЙ РЮКЗАК</span><h2>Что собрать из ресурсов?</h2></div>
            <ItemIcon icon="chest" color="#82d5f8" size="lg" />
          </div>
          <p>Отметь добычу — покажем только то, что действительно можно создать.</p>
          <div className="resource-promo__inventory">
            {Object.entries(inventory).filter(([, count]) => count > 0).slice(0, 6).map(([id, count]) => (
              <div className="mini-resource" key={id} title={getItemName(id)}>
                <TerrariaIcon itemKey={id} size="sm" />
                <strong>{count}</strong>
              </div>
            ))}
            <button className="mini-resource mini-resource--add" onClick={() => navigate('resources')} aria-label="Изменить рюкзак"><Plus size={18} /></button>
          </div>
          <div className="resource-promo__result">
            <span><Sparkles size={15} /> Сейчас доступно</span>
            <strong>{craftable.length} <small>рецептов</small></strong>
          </div>
          <div className="resource-promo__recipes">
            {craftable.slice(0, 4).map((recipe) => <button key={recipe.id} onClick={() => setModal({ type: 'recipe', item: recipe })} title={recipe.name}><TerrariaIcon itemKey={recipe.result} /></button>)}
            {craftable.length > 4 && <span>+{craftable.length - 4}</span>}
          </div>
          <button className="button button--soft button--full" onClick={() => navigate('resources')}>
            Открыть рюкзак <ArrowRight size={17} />
          </button>
        </Reveal>

        <Reveal className={`build-challenge ${challengeAccepted ? 'is-accepted' : ''}`} delay={0.1}>
          <img src="images/treehouse-challenge.webp" alt="Референс уютного дома на большом дереве" />
          <div className="build-challenge__shade" />
          <div className="build-challenge__top"><span className="glass-label"><Hammer size={14} /> ЧЕЛЛЕНДЖ НЕДЕЛИ</span><span className="difficulty">СРЕДНИЙ</span></div>
          <div className="build-challenge__content">
            <span className="eyebrow eyebrow--light">СТРОИТЕЛЬНЫЙ РЕФЕРЕНС</span>
            <h2>Дом на живом дереве</h2>
            <p>3 комнаты · скрытый проход · тёплый свет</p>
            <button
              className={`button ${challengeAccepted ? 'button--accepted' : 'button--light'}`}
              onClick={() => {
                setChallengeAccepted(!challengeAccepted);
                showToast(challengeAccepted ? 'Челлендж убран из планов.' : 'Челлендж добавлен в твои планы!');
              }}
            >
              {challengeAccepted ? <><Check size={17} /> Челлендж принят</> : <>Принять челлендж <ArrowRight size={17} /></>}
            </button>
          </div>
        </Reveal>
      </section>

      <section className="journal-preview-section">
        <Reveal>
          <SectionHeading
            eyebrow="ЛИЧНОЕ · ТОЛЬКО ТВОЁ"
            title="Страницы приключений"
            description="Мир помнит победы. Здесь остаётся всё остальное."
            action={<InlineLink onClick={() => navigate('journal')}>Открыть дневник</InlineLink>}
          />
        </Reveal>
        <div className="journal-preview-grid">
          {journal.slice(0, 2).map((entry, index) => (
            <Reveal key={entry.id} className="journal-note" delay={index * 0.09}>
              <div className="journal-note__day"><strong>{String(entry.day).padStart(2, '0')}</strong><span>ДЕНЬ</span></div>
              <div className="journal-note__body">
                <div className="journal-note__meta"><span>{entry.tag}</span><time>{entry.date}</time>{entry.favorite && <Heart size={14} fill="currentColor" />}</div>
                <h3>{entry.title}</h3><p>{entry.text}</p>
              </div>
            </Reveal>
          ))}
          <Reveal className="journal-new" delay={0.18}>
            <button onClick={() => setModal({ type: 'journal-new' })}>
              <span><Plus size={22} /></span><strong>Новая страница</strong><small>Записать момент</small>
            </button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
