import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('app_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('app_theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center bg-white/80 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group"
      title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
      aria-label="Cambiar Tema"
    >
      {isDark ? (
        <Icons.Sun className="w-5 h-5 text-amber-400 transition-transform group-hover:rotate-45" />
      ) : (
        <Icons.Moon className="w-5 h-5 text-cyan-600 transition-transform group-hover:-rotate-12" />
      )}
    </button>
  );
};
