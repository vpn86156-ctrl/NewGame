import { motion } from 'framer-motion';
import { getItemColor, getItemName, getNamedSprite, getSourceName, getSprite } from '../gameData';

const pixelSizes = { sm: 23, md: 32, lg: 42, xl: 55, hero: 88 };

export function AtlasSprite({ sprite, label, size = 32, className = '' }) {
  if (!sprite) return <span className={`game-sprite game-sprite--missing ${className}`} style={{ width: size, height: size }} aria-label={label} />;
  const { coordinates, sheet } = sprite;
  const [, x, y, width, height] = coordinates;
  const scale = Math.min(size / width, size / height);
  const shownWidth = Math.max(1, Math.round(width * scale));
  const shownHeight = Math.max(1, Math.round(height * scale));
  return (
    <span
      className={`game-sprite ${className}`}
      role="img"
      aria-label={label}
      style={{
        width: shownWidth,
        height: shownHeight,
        backgroundImage: `url("${sheet.file}")`,
        backgroundSize: `${sheet.w * scale}px ${sheet.h * scale}px`,
        backgroundPosition: `-${x * scale}px -${y * scale}px`,
      }}
    />
  );
}

export function GameSprite({ itemKey, size = 32, className = '' }) {
  return <AtlasSprite sprite={getSprite(itemKey)} label={getItemName(itemKey)} size={size} className={className} />;
}

export function NamedSprite({ icon, label, size = 32, className = '' }) {
  return <AtlasSprite sprite={getNamedSprite(icon)} label={label || icon} size={size} className={className} />;
}

export function SourceSprite({ source, size = 40, className = '' }) {
  return <NamedSprite icon={source?.icon} label={getSourceName(source)} size={size} className={className} />;
}

export default function TerrariaIcon({ itemKey, size = 'md', className = '', noSlot = false, layoutId }) {
  const pixelSize = typeof size === 'number' ? size : pixelSizes[size] ?? 32;
  if (noSlot) return <GameSprite itemKey={itemKey} size={pixelSize} className={className} />;
  const Component = layoutId ? motion.span : 'span';
  const sharedMotion = layoutId ? {
    layoutId,
    layout: 'position',
    transition: { type: 'spring', stiffness: 420, damping: 36, mass: 0.75 },
  } : {};
  return (
    <Component className={`item-icon item-icon--${size} terraria-icon ${className}`} style={{ '--item-color': getItemColor(itemKey) }} data-shared-icon={layoutId || undefined} {...sharedMotion}>
      <GameSprite itemKey={itemKey} size={pixelSize} />
    </Component>
  );
}
