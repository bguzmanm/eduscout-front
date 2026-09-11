'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-tiza py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="EduScout"
                width={509}
                height={470}
                className="h-12 w-auto"
              />
            </div>
            <p className="text-sm text-piedra mt-3 max-w-sm leading-relaxed">
              Recopilamos ofertas de trabajo para docentes de educación superior
              desde múltiples universidades. Todo en un solo lugar.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-azul uppercase tracking-widest mb-4">
              Plataforma
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/ofertas"
                  className="text-sm text-piedra hover:text-azul transition-colors"
                >
                  Buscar ofertas
                </Link>
              </li>
              <li>
                <Link
                  href="/fuentes"
                  className="text-sm text-piedra hover:text-azul transition-colors"
                >
                  Ver fuentes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-azul uppercase tracking-widest mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/privacidad"
                  className="text-sm text-piedra hover:text-azul transition-colors"
                >
                  Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos"
                  className="text-sm text-piedra hover:text-azul transition-colors"
                >
                  Términos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-tiza flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-piedra">
          <p>© 2026 EduScout</p>
        </div>
      </div>
    </footer>
  );
}
