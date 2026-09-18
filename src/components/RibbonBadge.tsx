'use client';

export default function RibbonBadge() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Entorno local"
      className="pointer-events-none fixed top-0 right-0 z-[60]"
    >
      <div className="absolute top-4 right-[-42px] w-[180px] rotate-45 bg-dorado text-white font-mono text-xs font-semibold tracking-widest text-center py-1.5 shadow-md">
        LOCAL
      </div>
    </div>
  );
}