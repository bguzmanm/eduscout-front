'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Settings, Bell, User, Search, Compass, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/ofertas', label: 'Buscar ofertas', icon: Search },
  { href: '/fuentes', label: 'Fuentes', icon: Compass },
  { href: '/alertas', label: 'Mis alertas', icon: Bell, noPrefetch: true },
  { href: '/perfil', label: 'Mi perfil', icon: User },
  { href: '/admin', label: 'Admin', icon: Settings, noPrefetch: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

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
            {NAV_LINKS.map(({ href, label, icon: Icon, noPrefetch }) => (
              <Link
                key={href}
                href={href}
                prefetch={noPrefetch ? false : undefined}
                aria-label={label}
                className="inline-flex items-center gap-1.5 text-sm text-piedra hover:text-azul transition-colors font-medium px-3 py-1.5 rounded-md hover:bg-tiza/30"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            className="flex items-center justify-center md:hidden p-2 rounded-lg text-azul hover:bg-tiza/40 transition-colors"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-tiza bg-arena/95 backdrop-blur-md shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 space-y-1">
            {NAV_LINKS.map(
              ({ href, label, icon: Icon, noPrefetch }) => (
                <Link
                  key={href}
                  href={href}
                  prefetch={noPrefetch ? false : undefined}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-azul rounded-lg hover:bg-tiza/40 transition-colors"
                >
                  <Icon className="w-5 h-5 text-piedra" />
                  {label}
                </Link>
              ),
            )}
          </div>
        </div>
      )}
    </nav>
  );
}