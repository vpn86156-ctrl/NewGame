import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, BookMarked, BookOpen, Box, Check, ChevronRight, CircleDot, Cloud, Cog,
  Compass, Crown, Diamond, Eye, Feather, Fish, Flame, FlaskConical, Footprints, Gem,
  Grid3X3, Hammer, HardHat, Heart, Home, Landmark, Layers3, Leaf, LockKeyhole, Moon,
  Mountain, PackageOpen, Pickaxe, Scan, ScrollText, Shield, Skull, Sparkles, Star,
  Sun, Sword, Swords, Target, TreePine, Trophy, X,
} from 'lucide-react';
import { useLockBody } from '../hooks';

const iconMap = {
  sun: Sun, crown: Crown, eye: Eye, skull: Skull, flame: Flame, gear: Cog, leaf: Leaf,
  temple: Landmark, moon: Moon, wood: TreePine, stone: Mountain, gel: Cloud, torch: Flame,
  bar: Layers3, lens: CircleDot, star: Star, web: Grid3X3, sand: Mountain, glass: Diamond,
  silk: Layers3, workbench: Hammer, sword: Sword, bow: Target, anvil: Hammer,
  campfire: Flame, furnace: Box, pickaxe: Pickaxe, helmet: HardHat, mana: Gem,
  bottle: FlaskConical, boot: Footprints, mirror: Scan, ring: CircleDot, book: BookOpen,
  charm: Gem, home: Home, chest: PackageOpen, swords: Swords, fish: Fish, shield: Shield,
  compass: Compass, trophy: Trophy, journal: BookMarked, scroll: ScrollText,
};

export function ItemIcon({ icon = 'sparkles', color = '#d5f96f', size = 'md', className = '' }) {
  const Icon = iconMap[icon] || Sparkles;
  return (
    <span className={`item-icon item-icon--${size} ${className}`} style={{ '--item-color': color }} aria-hidden="true">
      <Icon strokeWidth={1.65} />
    </span>
  );
}

export function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`}>
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" shapeRendering="crispEdges">
          <path d="M18 33V20H10v-8h8V4h6v8h8v8h-8v13" fill="currentColor" />
          <path d="M13 34h16v4H13z" fill="currentColor" opacity=".48" />
          <path d="M5 17h5v7H5zm27-8h4v6h-4z" fill="currentColor" opacity=".7" />
        </svg>
      </span>
      <span className="brand__text">
        <strong>TERRA</strong>
        {!compact && <small>ЛЕТОПИСЬ</small>}
      </span>
    </div>
  );
}

export function PixelGuide({ size = 84 }) {
  return (
    <svg className="pixel-guide" width={size} height={size} viewBox="0 0 64 64" shapeRendering="crispEdges" aria-label="Портрет Гида" role="img">
      <rect width="64" height="64" rx="10" fill="#1b2925" />
      <rect x="8" y="8" width="48" height="48" fill="#243730" />
      <path d="M20 19h4v-5h18v4h5v16h-5v5h-5v5H26v-5h-6V23h-3v-5h3z" fill="#c99b70" />
      <path d="M18 21v-7h5V9h19v5h5v10h-5v-7h-4v4h-5v-5H22v8h-4z" fill="#5c4030" />
      <path d="M20 19h4v-5h16v3H27v5h-7z" fill="#7a573d" />
      <rect x="24" y="26" width="4" height="3" fill="#2d3029" />
      <rect x="37" y="26" width="4" height="3" fill="#2d3029" />
      <rect x="31" y="29" width="4" height="6" fill="#ac7859" />
      <rect x="28" y="37" width="10" height="3" fill="#7d5141" />
      <path d="M20 43h6v5h12v-5h7v4h5v13H14V47h6z" fill="#5c8b55" />
      <path d="M26 43h12v7H26z" fill="#d2ae7e" />
      <path d="M28 48h8v12h-8z" fill="#d7c7a1" />
      <rect x="17" y="50" width="5" height="10" fill="#476e47" />
      <rect x="43" y="49" width="5" height="11" fill="#476e47" />
      <rect x="5" y="5" width="4" height="4" fill="#d5f96f" opacity=".8" />
      <rect x="53" y="48" width="3" height="3" fill="#d5f96f" opacity=".4" />
    </svg>
  );
}

export function Reveal({ children, className = '', delay = 0, as = 'div', ...props }) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as] || motion.div;
  return (
    <Component
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 34, scale: 0.985, filter: 'blur(5px)' }}
      whileInView={reduceMotion ? {} : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -30px' }}
      transition={{ duration: 0.62, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </Component>
  );
}

export function SectionHeading({ eyebrow, title, description, action, className = '' }) {
  return (
    <div className={`section-heading ${className}`}>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <Reveal className="page-header">
      <div className="page-header__copy">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="page-header__actions">{children}</div>}
    </Reveal>
  );
}

export function ProgressRing({ value, size = 82, stroke = 7, children }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="progress-ring__track" cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} />
        <motion.circle
          className="progress-ring__value" cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke}
          strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference }}
          transition={{ duration: 1, ease: 'easeOut' }} transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="round"
        />
      </svg>
      <div className="progress-ring__content">{children}</div>
    </div>
  );
}

export function Modal({ children, onClose, className = '', label = 'Диалог' }) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useLockBody(true);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement;
    if (!dialogRef.current?.contains(document.activeElement)) closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, []);

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <motion.section
        ref={dialogRef} className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={label}
        initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      >
        <button ref={closeRef} className="icon-button modal__close" onClick={onClose} aria-label="Закрыть">
          <X size={19} />
        </button>
        {children}
      </motion.section>
    </motion.div>
  );
}

export function EmptyState({ icon = 'compass', title, text, action }) {
  return (
    <div className="empty-state">
      <ItemIcon icon={icon} size="lg" />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function InlineLink({ children, onClick, className = '' }) {
  return <button className={`inline-link ${className}`} onClick={onClick}>{children}<ArrowRight size={15} /></button>;
}

export function CheckLine({ checked = false, children }) {
  return <li className={checked ? 'is-checked' : ''}><span>{checked ? <Check size={14} /> : <ChevronRight size={14} />}</span>{children}</li>;
}

export { AnimatePresence, motion, Heart, LockKeyhole, Sparkles };
