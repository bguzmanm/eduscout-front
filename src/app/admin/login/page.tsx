'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError('Credenciales inválidas.');
        return;
      }

      const json = await res.json();
      const token: string = json.data.token;
      const maxAge = 7200;
      const secure = location.protocol === 'https:' || location.hostname === 'localhost';
      document.cookie = `eduscout_admin_session=${token}; path=/admin; max-age=${maxAge}; samesite=strict${secure ? '; Secure' : ''}`;

      router.push('/admin');
    } catch {
      setError('Error de conexión. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-arena">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-azul/10 mb-4">
            <Lock className="w-7 h-7 text-azul" />
          </div>
          <h1 className="text-2xl font-display font-bold text-azul">
            Acceso administrativo
          </h1>
          <p className="text-sm text-piedra mt-1">
            Ingresa tus credenciales para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-tiza rounded-xl p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-azul mb-1">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-tiza rounded-lg text-sm text-azul focus:outline-none focus:ring-2 focus:ring-dorado/50 focus:border-dorado transition-colors"
              placeholder="admin"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-azul mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-tiza rounded-lg text-sm text-azul focus:outline-none focus:ring-2 focus:ring-dorado/50 focus:border-dorado transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-azul rounded-lg hover:bg-azul/90 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ingresando…
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}