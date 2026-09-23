import Link from 'next/link';
import type { Metadata } from 'next';
import { SearchX, Search, ArrowRight, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="pt-16">
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-dorado/10 flex items-center justify-center mx-auto mb-6">
            <SearchX className="w-6 h-6 text-dorado" />
          </div>

          <p className="text-sm font-semibold text-dorado uppercase tracking-widest mb-4">
            Error 404
          </p>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-azul tracking-tight">
            Página no
            <br />
            <span className="text-dorado">encontrada</span>
          </h1>

          <p className="mt-4 text-lg text-piedra max-w-2xl mx-auto leading-relaxed">
            La página que buscas no existe o fue movida. Quizás una oferta
            expiró o el enlace está desactualizado.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/ofertas"
              className="inline-flex items-center justify-center gap-2 bg-azul text-white px-6 py-3 rounded-md text-sm font-semibold hover:bg-marino transition-colors"
            >
              <Search className="w-4 h-4" /> Buscar ofertas
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border border-tiza text-azul px-6 py-3 rounded-md text-sm font-semibold hover:border-dorado transition-colors"
            >
              <Home className="w-4 h-4" /> Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
