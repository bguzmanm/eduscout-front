'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, KeyRound, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { requestPasswordReset, resetCandidatePassword } from '@/lib/api';

export default function RecuperarForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await requestPasswordReset({ email });
      setSuccess(result.message);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await resetCandidatePassword({ token, newPassword });
      setNewPassword('');
      setConfirm('');
      setSuccess(result.message);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full px-3 py-2 border border-tiza rounded-lg text-sm text-azul focus:outline-none focus:ring-2 focus:ring-dorado/50 focus:border-dorado transition-colors';

  return (
    <div className="bg-white border border-tiza rounded-xl p-8">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-azul/10 flex items-center justify-center mb-4">
          {token ? (
            <KeyRound className="w-8 h-8 text-azul" />
          ) : (
            <ShieldCheck className="w-8 h-8 text-azul" />
          )}
        </div>
        <h1 className="text-2xl font-display font-bold text-azul">
          {token ? 'Nueva contraseña' : 'Recuperar contraseña'}
        </h1>
        <p className="text-sm text-piedra mt-2">
          {token
            ? 'Elige una nueva contraseña para tu cuenta.'
            : 'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.'}
        </p>
      </div>

      {success && (
        <div className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
            {success}
          </div>
          {token && (
            <Link
              href="/perfil"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-azul rounded-lg hover:bg-azul/90 transition-colors"
            >
              Ir a mi perfil
            </Link>
          )}
          {!token && (
            <Link
              href="/perfil"
              className="inline-flex items-center gap-2 text-sm font-medium text-azul hover:text-marino transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a iniciar sesión
            </Link>
          )}
        </div>
      )}

      {!success && (
        <form
          onSubmit={token ? handleReset : handleRequest}
          className="space-y-5"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          {token ? (
            <>
              <div>
                <label
                  htmlFor="nueva-clave"
                  className="block text-sm font-medium text-azul mb-1"
                >
                  Nueva contraseña
                </label>
                <input
                  id="nueva-clave"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={100}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label
                  htmlFor="repetir-clave"
                  className="block text-sm font-medium text-azul mb-1"
                >
                  Repetir nueva contraseña
                </label>
                <input
                  id="repetir-clave"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  maxLength={100}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-piedra mt-1">
                Mínimo 8 caracteres, con letras y números.
              </p>
            </>
          ) : (
            <div>
              <label
                htmlFor="correo"
                className="block text-sm font-medium text-azul mb-1"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-piedra" />
                <input
                  id="correo"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass} pl-9`}
                  placeholder="tucorreo@ejemplo.cl"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-azul rounded-lg hover:bg-azul/90 transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {token ? 'Restablecer contraseña' : 'Enviar enlace'}
          </button>
        </form>
      )}

      {!success && !token && (
        <Link
          href="/perfil"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-azul hover:text-marino transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a iniciar sesión
        </Link>
      )}
    </div>
  );
}