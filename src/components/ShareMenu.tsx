'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  Facebook,
  Link2,
  Linkedin,
  Mail,
  MessageCircle,
  Share2,
  Smartphone,
  Twitter,
} from 'lucide-react';
import { SITE_NAME, SITE_URL } from '@/lib/site';

interface ShareMenuProps {
  jobId: number;
  title: string;
  variant?: 'icon' | 'label';
  className?: string;
}

const MENU_WIDTH = 232;
const VIEWPORT_MARGIN = 8;
const TRIGGER_GAP = 8;

const itemClass =
  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-piedra hover:bg-arena hover:text-azul transition-colors';

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Contexto no seguro (http): recurre al método clásico.
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export default function ShareMenu({
  jobId,
  title,
  variant = 'icon',
  className = '',
}: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const url = `${SITE_URL}/ofertas/${jobId}`;
  const text = `${title} · ${SITE_NAME}`;
  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  // Posiciona el popover a la derecha del disparador, corrigiendo el margen
  // contra los bordes de la ventana.
  const openMenu = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    // Se ancla antes de abrir para que el menú nazca ya visible: enfocar un
    // elemento invisible es un no-op en el navegador.
    if (rect) {
      setStyle({
        left: Math.min(
          Math.max(VIEWPORT_MARGIN, rect.right - MENU_WIDTH),
          window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN,
        ),
        top: Math.min(
          Math.max(VIEWPORT_MARGIN, rect.bottom + TRIGGER_GAP),
          window.innerHeight - VIEWPORT_MARGIN,
        ),
      });
    }
    setOpen(true);
  }, []);

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;
    const rect = trigger.getBoundingClientRect();
    const { height } = menu.getBoundingClientRect();
    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, rect.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN,
    );
    let top = rect.bottom + TRIGGER_GAP;
    if (top + height > window.innerHeight - VIEWPORT_MARGIN) {
      const above = rect.top - TRIGGER_GAP - height;
      top =
        above >= VIEWPORT_MARGIN
          ? above
          : Math.max(VIEWPORT_MARGIN, window.innerHeight - height - VIEWPORT_MARGIN);
    }
    setStyle((prev) =>
      prev.top === top && prev.left === left ? prev : { top, left },
    );
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const reposition = () => place();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      close(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );

    function moveFocus(step: number) {
      if (items.length === 0) return;
      const index = items.indexOf(document.activeElement as HTMLElement);
      const next = (index + step + items.length) % items.length;
      items[next].focus();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        moveFocus(event.key === 'ArrowDown' ? 1 : -1);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  async function handleCopy() {
    close();
    if (await copyToClipboard(url)) {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2500);
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, text, url });
      close(false);
    } catch {
      // El usuario canceló el diálogo: no hacemos nada.
    }
  }

  const label = copied ? 'Enlace copiado' : 'Compartir oferta';
  // Texto visible más corto que el aria-label: con "Compartir oferta" los dos
  // botones de la tarjeta (guardar + compartir) no cabían en 375px.
  const triggerText = copied ? 'Enlace copiado' : 'Compartir';
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-colors';
  const sizing =
    variant === 'icon' ? 'p-2 rounded-full shrink-0' : 'px-4 py-2.5 text-sm rounded-lg shrink-0';
  const tones = copied
    ? 'text-green-700 bg-green-50'
    : 'text-piedra hover:text-azul hover:bg-tiza/60';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close(false) : openMenu())}
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${base} ${sizing} ${tones} ${className}`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
        {variant === 'label' && <span>{triggerText}</span>}
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Opciones para compartir"
            style={{ ...style, width: MENU_WIDTH }}
            className="fixed z-60 bg-white border border-tiza rounded-lg shadow-lg py-1"
          >
            <a
              role="menuitem"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={itemClass}
              onClick={() => close(false)}
            >
              <Twitter className="w-4 h-4 shrink-0" />
              Compartir en X
            </a>
            <a
              role="menuitem"
              href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={itemClass}
              onClick={() => close(false)}
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              Compartir por WhatsApp
            </a>
            <a
              role="menuitem"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={itemClass}
              onClick={() => close(false)}
            >
              <Facebook className="w-4 h-4 shrink-0" />
              Compartir en Facebook
            </a>
            <a
              role="menuitem"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={itemClass}
              onClick={() => close(false)}
            >
              <Linkedin className="w-4 h-4 shrink-0" />
              Compartir en LinkedIn
            </a>
            <a
              role="menuitem"
              href={`mailto:?subject=${encodeURIComponent(`${title} · ${SITE_NAME}`)}&body=${encodeURIComponent(`${text}\n${url}`)}`}
              className={itemClass}
              onClick={() => close(false)}
            >
              <Mail className="w-4 h-4 shrink-0" />
              Enviar por correo
            </a>
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => void handleCopy()}
            >
              <Link2 className="w-4 h-4 shrink-0" />
              Copiar enlace
            </button>
            {canNativeShare && (
              <button
                type="button"
                role="menuitem"
                className={itemClass}
                onClick={() => void handleNativeShare()}
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                Compartir con el sistema
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
