import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import RecuperarForm from './RecuperarForm';

export default function RecuperarPage() {
  return (
    <main className="pt-16 min-h-screen bg-arena">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-azul animate-spin" />
            </div>
          }
        >
          <RecuperarForm />
        </Suspense>
      </div>
    </main>
  );
}