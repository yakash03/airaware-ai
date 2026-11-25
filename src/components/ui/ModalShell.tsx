// AirAware AI V2 — Accessible Modal Shell Component
// Provides Escape key handling, backdrop click dismissal, focus management, and ARIA semantics.

'use client';

import React, { useEffect, useRef } from 'react';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconContainerClassName?: string;
  maxWidthClassName?: string;
  children: React.ReactNode;
}

export function ModalShell({
  isOpen,
  onClose,
  titleId,
  title,
  subtitle,
  icon,
  iconContainerClassName = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400',
  maxWidthClassName = 'max-w-2xl',
  children,
}: ModalShellProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs"
    >
      <div
        className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl ${maxWidthClassName} w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-6`}
      >
        <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`p-2.5 rounded-2xl shrink-0 ${iconContainerClassName}`}>
                {icon}
              </div>
            )}
            <div>
              <h3
                id={titleId}
                className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight"
              >
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold px-2.5 cursor-pointer"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
