export function NoiseBackground({
  className = '',
  opacity = 1
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 h-full w-full ${className}`}
      style={{
        backgroundImage: `url("/grain-bg.svg")`,
        backgroundRepeat: 'repeat',
        opacity: opacity
      }}
    />
  );
}
