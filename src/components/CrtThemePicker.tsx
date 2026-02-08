import React from 'react';
import { useCrtTheme, type CrtTheme } from '@/hooks/useCrtTheme';
import { cn } from '@/lib/utils';

const themes: { id: CrtTheme; label: string; color: string }[] = [
  { id: 'green', label: 'Green Phosphor', color: '#00ff00' },
  { id: 'amber', label: 'Amber Phosphor', color: '#FFB000' },
  { id: 'blue', label: 'Blue Phosphor', color: '#00BFFF' },
];

export function CrtThemePicker() {
  const { theme, setTheme } = useCrtTheme();

  return (
    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="CRT color theme">
      {themes.map(t => (
        <button
          key={t.id}
          role="radio"
          aria-checked={theme === t.id}
          aria-label={t.label}
          title={t.label}
          onClick={() => setTheme(t.id)}
          className={cn(
            "w-4 h-4 rounded-full border-2 transition-all",
            theme === t.id
              ? "scale-110 shadow-lg"
              : "opacity-50 hover:opacity-80"
          )}
          style={{
            backgroundColor: t.color,
            borderColor: theme === t.id ? t.color : 'rgba(255,255,255,0.2)',
            boxShadow: theme === t.id ? `0 0 8px ${t.color}` : 'none',
          }}
        />
      ))}
    </div>
  );
}
