import Link from 'next/link';
import SourceLogo from '@/components/SourceLogo';
import type { Source } from '@/lib/api';

// Selección curada de instituciones destacadas en el home, en orden de
// aparición (alternando universidades e institutos). Los slugs que no
// existan en la base simplemente se omiten.
const FEATURED_SLUGS = [
  'uc',
  'inacap',
  'uchile',
  'duoc',
  'usm',
  'aiep',
  'udec',
  'iacc',
  'unab',
  'iplacex',
  'udla',
  'ip-chile',
  'uai',
  'ucsh',
];

function pickFeatured(sources: Source[]): Source[] {
  const bySlug = new Map(sources.map((s) => [s.slug, s]));
  return FEATURED_SLUGS.flatMap((slug) => {
    const source = bySlug.get(slug);
    return source && source.isActive ? [source] : [];
  });
}

export default function SourceMarquee({ sources }: { sources: Source[] }) {
  const featured = pickFeatured(sources);
  if (featured.length === 0) return null;

  const loop = [...featured, ...featured];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-display font-bold text-azul mb-2 text-center">
          ¿De dónde vienen las ofertas?
        </h2>
        <p className="text-sm text-piedra text-center mb-10 max-w-2xl mx-auto">
          Cada día revisamos las publicaciones de multiples instituciones de
          educación superior. Estas son algunas:
        </p>

        <Link
          href="/fuentes"
          className="marquee-link block cursor-pointer"
          aria-label="Ver todas las instituciones"
        >
          <div className="marquee-mask overflow-hidden">
            <div className="marquee-track flex w-max items-center">
              {loop.map((source, i) => (
                <div
                  key={`${source.id}-${i}`}
                  className="shrink-0 px-5 sm:px-8 w-36 sm:w-40 flex flex-col items-center gap-2 text-center"
                  aria-hidden={i >= featured.length}
                >
                  <SourceLogo
                    src={source.logoUrl}
                    name={source.name}
                    size={48}
                  />
                  <span className="text-xs font-medium text-azul/80 leading-tight line-clamp-2">
                    {source.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
