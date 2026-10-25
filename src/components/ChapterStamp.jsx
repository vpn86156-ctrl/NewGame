import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Feather } from 'lucide-react';
import { stages } from '../data';
import StageIcon from './StageIcon';

export default function ChapterStamp() {
  const [stageId, setStageId] = useState(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    let timer;
    const celebrate = (event) => {
      window.clearTimeout(timer);
      setStageId(event.detail?.stageId || null);
      timer = window.setTimeout(() => setStageId(null), 2300);
    };
    window.addEventListener('terra:stage-complete', celebrate);
    return () => { window.clearTimeout(timer); window.removeEventListener('terra:stage-complete', celebrate); };
  }, []);
  const stage = stages.find((entry) => entry.id === stageId);
  return (
    <AnimatePresence>{stage && <motion.div
      key={stage.id} className="chapter-stamp" role="status" aria-live="polite"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.82, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.05, y: -14 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.36, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="chapter-stamp__pixels" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} style={{ '--pixel-index': index }} />)}</div>
      <div className="chapter-stamp__seal"><StageIcon stageId={stage.id} color={stage.color} size="lg" /><span><Check size={20} /></span></div>
      <span className="eyebrow"><Feather size={13} /> ГЛАВА {stage.roman} ЗАПИСАНА</span>
      <strong>{stage.title}</strong>
      <p>Победа сохранена в твоей летописи</p>
    </motion.div>}</AnimatePresence>
  );
}
