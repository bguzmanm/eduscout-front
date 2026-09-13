'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Settings } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-arena/80 backdrop-blur-md border-b border-tiza">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo-icon.png"
              alt="EduScout"
              width={335}
              height={331}
              className="h-11 w-auto"
              priority
            />
            <span className="text-xl font-display font-bold text-azul tracking-tight">
              EduScout
            </span>
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
            <Link
              href="/admin"
              className="text-sm text-piedra hover:text-azul transition-colors font-medium px-3 py-1.5 rounded-md hover:bg-tiza/30 inline-flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4" />
              Admin
            </Link>
          </div>

          <div className="flex items-center md:hidden space-x-1">
            <Link
              href="/ofertas"
              className="text-sm text-piedra hover:text-azul transition-colors font-medium px-3 py-1.5"
            >
              Ofertas
            </Link>
            <Link
              href="/admin"
              className="text-sm text-piedra hover:text-azul transition-colors font-medium px-3 py-1.5"
              aria-label="Administración"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
