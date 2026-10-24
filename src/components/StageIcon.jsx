import TerrariaIcon from './TerrariaIcon';

export const stageAssets = {
  'king-slime': { file: 'king-slime.gif', name: 'Король слизней' },
  'eye-cthulhu': { file: 'eye-of-cthulhu.gif', name: 'Глаз Ктулху' },
  'evil-boss': { file: 'brain-of-cthulhu.gif', name: 'Мозг Ктулху' },
  skeletron: { file: 'skeletron.png', name: 'Скелетрон' },
  'wall-flesh': { file: 'wall-of-flesh.gif', name: 'Стена плоти' },
  mechanical: { file: 'the-twins.gif', name: 'Близнецы' },
  plantera: { file: 'plantera.gif', name: 'Плантера' },
  golem: { file: 'golem.gif', name: 'Голем' },
  cultist: { file: 'lunatic-cultist.png', name: 'Лунатик-культист' },
  'moon-lord': { file: 'moon-lord.gif', name: 'Лунный лорд' },
};

export default function StageIcon({ stageId, size = 'md', color = '#d5f96f', className = '' }) {
  const asset = stageAssets[stageId];
  if (!asset) return <TerrariaIcon itemKey="WorkBench" size={size} className={className} />;
  return (
    <span className={`item-icon item-icon--${size} boss-icon ${className}`} style={{ '--item-color': color }}>
      <img src={`images/bosses/${asset.file}`} alt={asset.name} loading="lazy" />
    </span>
  );
}
