export function GridBackground({
  className = '',
  opacity = 0.5,
  size = 1000
}: {
  className?: string;
  opacity?: number;
  size?: number;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden ${className}`}
    >
      <div
        className='absolute inset-0'
        style={{
          backgroundImage: `url("/grid-bg.svg")`,
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          backgroundSize: `${size}px ${size}px`,
          opacity: opacity,
          maskImage:
            'radial-gradient(circle at center, black 0%, transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(circle at center, black 0%, transparent 70%)'
        }}
      />
    </div>
  );
}
