"use client";

import { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';
import { getAvatarUrl } from '@/utils/imageUrl';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: number; // pixel size, e.g. 32, 40, 48, 96, 128
  className?: string;
  fallbackClassName?: string;
  alt?: string;
}

export function UserAvatar({
  src,
  name,
  size = 40,
  className = '',
  fallbackClassName = '',
  alt,
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = getAvatarUrl(src);

  // Reset error when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initial = name && name.trim() ? name.trim().charAt(0) : '';

  if (resolvedUrl && !hasError) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative rounded-full overflow-hidden shrink-0 select-none bg-surface-variant ${className}`}
      >
        <img
          src={resolvedUrl}
          alt={alt || name || 'صورة المستخدم'}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 select-none overflow-hidden ${fallbackClassName || className}`}
    >
      {initial ? (
        <span style={{ fontSize: Math.max(12, Math.round(size * 0.42)) }}>{initial}</span>
      ) : (
        <UserCircle style={{ width: size * 0.7, height: size * 0.7 }} className="text-primary" />
      )}
    </div>
  );
}
