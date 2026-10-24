import { useCallback, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLockBody } from '../hooks';

export default function Intro({ onDone }) {
  const reduceMotion = useReducedMotion();
  useLockBody(true);

  const finish = useCallback(() => {
    try { window.sessionStorage.setItem('terra-intro-seen', 'true'); } catch { /* no-op */ }
    onDone();
  }, [onDone]);

  useEffect(() => {
    const timer = window.setTimeout(finish, reduceMotion ? 900 : 4600);
    const onKey = (event) => { if (event.key === 'Escape') finish(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [finish, reduceMotion]);

  return (
    <motion.div className="intro" exit={{ opacity: 0, scale: 1.025 }} transition={{ duration: 0.75, ease: 'easeInOut' }}>
      <div className="intro__stars" aria-hidden="true" />
      <div className="intro__orbit intro__orbit--one" aria-hidden="true" />
      <div className="intro__orbit intro__orbit--two" aria-hidden="true" />
      <div className="intro__flash" aria-hidden="true" />
      <div className="intro__moon-glow" aria-hidden="true" />
      <div className="intro__boss" aria-hidden="true">
        <img src="images/bosses/moon-lord.gif" alt="Лунный лорд" />
      </div>
      <div className="intro__topline">
        <span>TERRARIA COMPANION</span>
        <button onClick={finish}>Пропустить <ArrowRight size={15} /></button>
      </div>
      <div className="intro__title">
        <span className="intro__pretitle">ТВОЙ МИР ПОМНИТ ВСЁ</span>
        <h1>TERRA</h1>
        <div className="intro__subtitle"><i />ЛЕТОПИСЬ<i /></div>
        <p>Путь • Истории • Приключения</p>
      </div>
      <button className="intro__enter" onClick={finish}>
        <span>Войти в мир</span><ArrowRight size={18} />
      </button>
      <div className="intro__loading" aria-hidden="true"><span /></div>
      <span className="intro__version">FAN PROJECT · 1.0</span>
    </motion.div>
  );
}
