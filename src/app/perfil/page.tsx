'use client';

import { FormEvent, useEffect, useSyncExternalStore, useState } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  FileText,
  Upload,
  LogOut,
  Bell,
  Loader2,
  Download,
  KeyRound,
} from 'lucide-react';
import {
  CandidateProfile,
  changeCandidatePassword,
  clearCandidateToken,
  downloadCandidateCv,
  getCandidateMe,
  getCandidateToken,
  loginCandidate,
  registerCandidate,
  setCandidateToken,
  updateCandidateMe,
  uploadCandidateCv,
} from '@/lib/api';

type AuthMode = 'login' | 'register';

const MAX_CV_SIZE = 5 * 1024 * 1024;

function formatSize(bytes: number | null): string {
  if (!bytes) return '-';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function isPdfFile(file: File): boolean {
  return !(file.type && file.type !== 'application/pdf');

}

function isPdfMagic(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);
  return (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<AuthMode>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [phone, setPhone] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvDownloadName, setCvDownloadName] = useState<string | null>(null);

  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const hydrated = useHydrated();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      const t = getCandidateToken();
      if (!t) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const me = await getCandidateMe(t);
        if (!cancelled) {
          setProfile(me);
          setPhone(me.phone ?? '');
        }
      } catch {
        if (!cancelled) {
          clearCandidateToken();
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAuthSubmit(e: FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const result =
        mode === 'login'
          ? await loginCandidate({ email: authEmail, password: authPassword })
          : await registerCandidate({
              name: authName,
              email: authEmail,
              password: authPassword,
            });
      setCandidateToken(result.token);
      window.location.reload();
    } catch (err) {
      setAuthError((err as Error).message);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    clearCandidateToken();
    setProfile(null);
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    setAuthError(null);
  }

  async function handleSavePhone() {
    const t = getCandidateToken();
    if (!t) return;
    setPhoneLoading(true);
    setSavedMessage(null);
    try {
      const updated = await updateCandidateMe(t, { phone });
      setProfile(updated);
      setSavedMessage('Teléfono actualizado con éxito.');
    } catch (err) {
      setSavedMessage((err as Error).message);
    } finally {
      setPhoneLoading(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    const t = getCandidateToken();
    if (!t) return;
    if (pwNew !== pwConfirm) {
      setPwMessage({
        type: 'error',
        text: 'Las contraseñas nuevas no coinciden.',
      });
      return;
    }
    setPwLoading(true);
    setPwMessage(null);
    try {
      await changeCandidatePassword(t, {
        currentPassword: pwCurrent,
        newPassword: pwNew,
      });
      setPwCurrent('');
      setPwNew('');
      setPwConfirm('');
      setPwMessage({ type: 'success', text: 'Contraseña actualizada con éxito.' });
    } catch (err) {
      setPwMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setPwLoading(false);
    }
  }

  async function handleUploadCv() {
    const t = getCandidateToken();
    if (!t || !cvFile) return;
    setCvError(null);
    setCvLoading(true);
    try {
      if (cvFile.size > MAX_CV_SIZE) {
        throw new Error('El CV no puede superar los 5 MB');
      }
      if (!isPdfFile(cvFile)) {
        throw new Error('El CV debe ser un archivo PDF');
      }
      const magic = await cvFile.arrayBuffer();
      if (!isPdfMagic(magic.slice(0, 8))) {
        throw new Error('El archivo no es un PDF válido');
      }
      const updated = await uploadCandidateCv(t, cvFile);
      setProfile(updated);
      setCvFile(null);
      setSavedMessage('CV subido con éxito. Aún no se procesa para IA.');
    } catch (err) {
      setCvError((err as Error).message);
    } finally {
      setCvLoading(false);
    }
  }

  async function handleDownloadCv() {
    const t = getCandidateToken();
    if (!t) return;
    try {
      const blob = await downloadCandidateCv(t);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cvDownloadName ?? 'cv.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setCvError((err as Error).message);
    }
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-arena">
        <Loader2 className="w-8 h-8 text-azul animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-arena">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-display font-bold text-azul mb-8">
          Mi perfil
        </h1>

        {!profile ? (
          <div className="bg-white border border-tiza rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-azul/10 mb-4">
                <User className="w-7 h-7 text-azul" />
              </div>
              <h2 className="text-xl font-display font-bold text-azul">
                {mode === 'login'
                  ? 'Inicia sesión en tu cuenta'
                  : 'Crea tu perfil'}
              </h2>
              <p className="text-sm text-piedra mt-1">
                Crea tu perfil para encontrar ofertas que calcen contigo.
              </p>
            </div>

            <div className="flex rounded-lg bg-tiza/40 p-1 mb-6 w-fit mx-auto">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setAuthError(null);
                  }}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    mode === m
                      ? 'bg-white text-azul shadow-sm'
                      : 'text-piedra hover:text-azul'
                  }`}
                >
                  {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
                  {authError}
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label htmlFor="auth-name" className="block text-sm font-medium text-azul mb-1">
                    Nombre completo
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full px-3 py-2 border border-tiza rounded-lg text-sm text-azul focus:outline-none focus:ring-2 focus:ring-dorado/50 focus:border-dorado transition-colors"
                    placeholder="Ej: María Fernanda Rojas"
                  />
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-sm font-medium text-azul mb-1">
                  Correo electrónico
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-tiza rounded-lg text-sm text-azul focus:outline-none focus:ring-2 focus:ring-dorado/50 focus:border-dorado transition-colors"
                  placeholder="tu@correo.cl"
                />
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-sm font-medium text-azul mb-1">
                  Contraseña
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-tiza rounded-lg text-sm text-azul focus:outline-none focus:ring-2 focus:ring-dorado/50 focus:border-dorado transition-colors"
                  placeholder="••••••••"
                />
                {mode === 'register' && (
                  <p className="text-xs text-piedra mt-1">
                    Mínimo 8 caracteres, con letras y números.
                  </p>
                )}
                {mode === 'login' && (
                  <div className="flex justify-end mt-1">
                    <Link
                      href="/recuperar"
                      className="text-xs font-medium text-azul hover:text-marino underline underline-offset-2 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!hydrated || authLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-azul rounded-lg hover:bg-azul/90 transition-colors disabled:opacity-60"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando…
                  </>
                ) : !hydrated ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cargando…
                  </>
                ) : mode === 'login' ? (
                  'Ingresar'
                ) : (
                  'Crear mi perfil'
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-tiza rounded-xl p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-azul/10 flex items-center justify-center shrink-0">
                  <span className="text-xl font-display font-bold text-azul">
                    {profile.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-display font-bold text-azul truncate">
                    {profile.name}
                  </h2>
                  <p className="text-sm text-piedra flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    {profile.email}
                  </p>
                </div>
                <Link
                  href="/alertas"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-azul rounded-lg hover:bg-marino transition-colors shrink-0"
                >
                  <Bell className="w-4 h-4" />
                  Ver mis alertas
                </Link>
              </div>
            </div>

            <div className="bg-white border border-tiza rounded-xl p-8">
              <h3 className="text-lg font-display font-bold text-azul mb-4">
                Información de contacto
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                <div className="flex-1 w-full">
                  <label htmlFor="phone" className="block text-sm font-medium text-azul mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Teléfono (opcional)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-tiza rounded-lg text-sm text-azul focus:outline-none focus:ring-2 focus:ring-dorado/50 focus:border-dorado transition-colors"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSavePhone}
                  disabled={phoneLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-azul rounded-lg hover:bg-azul/90 transition-colors disabled:opacity-60 w-full sm:w-auto justify-center"
                >
                  {phoneLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Guardar
                </button>
              </div>
              {savedMessage && (
                <p className="text-sm text-piedra mt-2">{savedMessage}</p>
              )}
            </div>

            <div className="bg-white border border-tiza rounded-xl p-8">
              <h3 className="text-lg font-display font-bold text-azul mb-2">
                Mi CV
              </h3>
              <p className="text-sm text-piedra mb-4">
                Adjunta tu CV en formato PDF (máx. 5 MB). Próximamente se procesará
                con IA para sugerirte ofertas afines.
              </p>

              {profile.cv.fileName && (
                <div className="flex items-center justify-between gap-4 bg-tiza/40 rounded-lg px-4 py-3 mb-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-5 h-5 text-azul shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-azul truncate">
                        {profile.cv.fileName}
                      </p>
                      <p className="text-xs text-piedra">
                        {formatSize(profile.cv.sizeBytes)} · subido el{' '}
                        {profile.cv.uploadedAt
                          ? new Date(profile.cv.uploadedAt).toLocaleDateString('es-CL', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (profile.cv.fileName) {
                        setCvDownloadName(profile.cv.fileName);
                        await handleDownloadCv();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-azul hover:text-marino transition-colors shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <input
                  id="cv-file"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => {
                    setCvFile(e.target.files?.[0] ?? null);
                    setCvError(null);
                  }}
                  className="block w-full text-sm text-piedra file:mr-4 file:px-4 file:py-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-azul/10 file:text-azul hover:file:bg-azul/20 file:cursor-pointer transition-colors"
                />
                <button
                  type="button"
                  onClick={handleUploadCv}
                  disabled={!cvFile || cvLoading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-dorado rounded-lg hover:bg-dorado/90 transition-colors disabled:opacity-50"
                >
                  {cvLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {profile.cv.fileName ? 'Reemplazar CV' : 'Subir CV'}
                </button>
              </div>
              {cvError && (
                <p className="text-sm text-red-700 mt-3">{cvError}</p>
              )}
            </div>

            <div className="bg-white border border-tiza rounded-xl p-8">
              <h3 className="text-lg font-display font-bold text-azul mb-4 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-piedra" />
                Cambiar contraseña
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="pw-current"
                    className="block text-sm font-medium text-azul mb-1"
                  >
                    Contraseña actual
                  </label>
                  <input
                    id="pw-current"
                    type="password"
                    autoComplete="current-password"
                    value={pwCurrent}
                    onChange={(e) => setPwCurrent(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-tiza rounded-lg text-sm text-azul focus:outline-none focus:ring-2 focus:ring-dorado/50 focus:border-dorado transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="pw-new"
                      className="block text-sm font-medium text-azul mb-1"
                    >
                      Nueva contraseña
                    </label>
                    <input
                      id="pw-new"
                      type="password"
                      autoComplete="new-password"
                      value={pwNew}
                      onChange={(e) => setPwNew(e.target.value)}
                      required
                      minLength={8}
                      maxLength={100}
                      className="w-full px-3 py-2 border border-tiza rounded-lg text-sm text-azul focus:outline-none focus:ring-2 focus:ring-dorado/50 focus:border-dorado transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pw-confirm"
                      className="block text-sm font-medium text-azul mb-1"
                    >
                      Repetir nueva contraseña
                    </label>
                    <input
                      id="pw-confirm"
                      type="password"
                      autoComplete="new-password"
                      value={pwConfirm}
                      onChange={(e) => setPwConfirm(e.target.value)}
                      required
                      minLength={8}
                      maxLength={100}
                      className="w-full px-3 py-2 border border-tiza rounded-lg text-sm text-azul focus:outline-none focus:ring-2 focus:ring-dorado/50 focus:border-dorado transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <p className="text-xs text-piedra mt-1">
                  Mínimo 8 caracteres, con letras y números.
                </p>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-azul rounded-lg hover:bg-azul/90 transition-colors disabled:opacity-60"
                >
                  {pwLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cambiar contraseña
                </button>
              </form>
              {pwMessage && (
                <p
                  className={`text-sm mt-3 ${
                    pwMessage.type === 'error' ? 'text-red-700' : 'text-green-700'
                  }`}
                >
                  {pwMessage.text}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm font-medium text-piedra hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}