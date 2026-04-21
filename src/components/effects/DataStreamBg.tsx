import MatrixRain from './MatrixRain';

interface DataStreamBgProps {
  accentColor?: string;
  /** Extra class applied to the wrapper, e.g. to pin z-index. */
  className?: string;
}

/**
 * Very subtle rain + vignette — designed to sit behind UI panels.
 * Use as a decorative background layer; it is always pointer-events: none.
 */
export default function DataStreamBg({
  accentColor = '#00ff00',
  className,
}: DataStreamBgProps) {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <MatrixRain accentColor={accentColor} opacity={0.18} speed={0.55} fontSize={12} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)',
        }}
      />
    </div>
  );
}
