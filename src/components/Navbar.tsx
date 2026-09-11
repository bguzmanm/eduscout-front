'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-arena/80 backdrop-blur-md border-b border-tiza">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="EduScout"
              width={509}
              height={470}
              className="h-9 w-auto"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/ofertas"
              className="text-sm text-piedra hover:text-azul transition-colors font-medium px-3 py-1.5 rounded-md hover:bg-tiza/30"
            >
              Buscar ofertas
            </Link>
            <Link
              href="/fuentes"
              className="text-sm text-piedra hover:text-azul transition-colors font-medium px-3 py-1.5 rounded-md hover:bg-tiza/30"
            >
              Fuentes
            </Link>
          </div>

          <div className="flex items-center md:hidden">
            <Link
              href="/ofertas"
              className="text-sm text-piedra hover:text-azul transition-colors font-medium px-3 py-1.5"
            >
              Ofertas
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
