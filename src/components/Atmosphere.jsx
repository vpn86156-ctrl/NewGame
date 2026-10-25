import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const themes = [
  { id: 'forest', top: '#10251f', bottom: '#07110e', glow: '#70e4c1', accent: '#d5f96f' },
  { id: 'slime', top: '#142621', bottom: '#08110f', glow: '#7fdcc6', accent: '#b7f27c' },
  { id: 'night', top: '#171d38', bottom: '#080d18', glow: '#82d5f8', accent: '#d6c5ff' },
  { id: 'corruption', top: '#21182f', bottom: '#0d0914', glow: '#c4a7ff', accent: '#b9dc72' },
  { id: 'dungeon', top: '#15202e', bottom: '#080e16', glow: '#82d5f8', accent: '#c4a7ff' },
  { id: 'underworld', top: '#2a1512', bottom: '#100908', glow: '#ef8b83', accent: '#f5bd67' },
  { id: 'hallow', top: '#192737', bottom: '#0a1019', glow: '#f0a6d5', accent: '#82d5f8' },
  { id: 'jungle', top: '#14261c', bottom: '#08110b', glow: '#70e4c1', accent: '#d5f96f' },
  { id: 'temple', top: '#292218', bottom: '#100e08', glow: '#e3ad79', accent: '#d5f96f' },
  { id: 'lunar', top: '#141b35', bottom: '#070b17', glow: '#82d5f8', accent: '#c4a7ff' },
  { id: 'moon', top: '#25152e', bottom: '#0d0814', glow: '#c4a7ff', accent: '#ef8b83' },
];

/** Lightweight biome-reactive scenery. No images, canvas or network requests. */
export default function Atmosphere({ stageIndex = 0 }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const safeIndex = Math.max(0, Math.min(themes.length - 1, Number(stageIndex) || 0));
  const theme = themes[safeIndex];

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.biome = theme.id;
    root.style.setProperty('--world-accent', theme.accent);
    root.style.setProperty('--world-glow', theme.glow);
  }, [theme]);

  useEffect(() => {
    if (reduceMotion) return undefined;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const render = () => {
      frame = 0;
      ref.current?.style.setProperty('--look-x', pointerX.toFixed(3));
      ref.current?.style.setProperty('--look-y', pointerY.toFixed(3));
    };
    const onPointer = (event) => {
      if (event.pointerType === 'touch') return;
      pointerX = ((event.clientX / window.innerWidth) - 0.5) * 2;
      pointerY = ((event.clientY / window.innerHeight) - 0.5) * 2;
      if (!frame) frame = requestAnimationFrame(render);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointer);
      if (frame) cancelAnimationFrame(frame);
      ref.current?.style.setProperty('--look-x', '0');
      ref.current?.style.setProperty('--look-y', '0');
    };
  }, [reduceMotion]);

  return (
    <div ref={ref} className="atmosphere" aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.div
          key={theme.id}
          className="atmosphere__theme"
          style={{ '--sky-top': theme.top, '--sky-bottom': theme.bottom, '--biome-glow': theme.glow, '--biome-accent': theme.accent }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 1.05, ease: 'easeOut' }}
        >
          <div className="atmosphere__sky" />
          <div className="atmosphere__stars">{Array.from({ length: 22 }, (_, index) => <i
            className="atmosphere__star" key={index}
            style={{ left: `${(index * 43 + 7) % 97}%`, top: `${(index * 29 + 5) % 69}%`, '--star-delay': `${-(index % 7) * 0.8}s` }}
          />)}</div>
          <div className="atmosphere__moon" />
          <div className="atmosphere__hill atmosphere__hill--far" />
          <div className="atmosphere__hill atmosphere__hill--near" />
          {Array.from({ length: 9 }, (_, index) => <span
            className="atmosphere__tree" key={index}
            style={{ '--tree-index': index, height: `${85 + (index * 31) % 65}px` }}
          ><i /></span>)}
          <div>{Array.from({ length: 15 }, (_, index) => <i
            className="atmosphere__particle" key={index}
            style={{ '--particle-x': `${4 + index * 6.4}%`, '--particle-delay': `${-index * 1.35}s`, '--particle-duration': `${12 + (index % 4) * 2}s` }}
          />)}</div>
        </motion.div>
      </AnimatePresence>
      <div className="atmosphere__vignette" />
    </div>
  );
}
