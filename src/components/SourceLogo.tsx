'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SourceLogoProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

function initials(name: string): string {
  const safe = (name ?? '').trim();
  const words = safe
    .replace(/^(Universidad|Instituto|IP|Centro|Inacap|Duoc)\s*/i, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return safe.slice(0, 2).toUpperCase() || '??';
}

export default function SourceLogo({
  src,
  name,
  size = 40,
  className = '',
}: SourceLogoProps) {
  const [imgError, setImgError] = useState(false);
  const showImg = src && !imgError;

  return (
    <div
      className={`relative rounded-full bg-azul/10 text-azul font-display font-bold flex items-center justify-center overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      title={name}
    >
      {showImg ? (
        <Image
          fill
          unoptimized
          src={src}
          alt={name}
          className="object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
