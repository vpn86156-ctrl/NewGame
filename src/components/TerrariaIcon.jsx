import { getItemColor, getItemName, getSprite } from '../gameData';

const pixelSizes = { sm: 23, md: 32, lg: 42, xl: 55, hero: 88 };

export function GameSprite({ itemKey, size = 32, className = '' }) {
  const sprite = getSprite(itemKey);
  if (!sprite) return <span className={`game-sprite game-sprite--missing ${className}`} style={{ width: size, height: size }} aria-label={getItemName(itemKey)} />;
  const { coordinates, sheet } = sprite;
  const [, x, y, width, height] = coordinates;
  const scale = Math.min(size / width, size / height);
  const shownWidth = Math.max(1, Math.round(width * scale));
  const shownHeight = Math.max(1, Math.round(height * scale));
  const sheetWidth = sheet.w * scale;
  const sheetHeight = sheet.h * scale;
  return (
    <span
      className={`game-sprite ${className}`}
      role="img"
      aria-label={getItemName(itemKey)}
      style={{
        width: shownWidth,
        height: shownHeight,
        backgroundImage: `url("${sheet.file}")`,
        backgroundSize: `${sheetWidth}px ${sheetHeight}px`,
        backgroundPosition: `-${x * scale}px -${y * scale}px`,
      }}
    />
  );
}

export default function TerrariaIcon({ itemKey, size = 'md', className = '', noSlot = false }) {
  const pixelSize = typeof size === 'number' ? size : pixelSizes[size] ?? 32;
  if (noSlot) return <GameSprite itemKey={itemKey} size={pixelSize} className={className} />;
  return (
    <span className={`item-icon item-icon--${size} terraria-icon ${className}`} style={{ '--item-color': getItemColor(itemKey) }}>
      <GameSprite itemKey={itemKey} size={pixelSize} />
    </span>
  );
}
