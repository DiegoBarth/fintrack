import { useCallback, useContext, useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { ThemeContext } from '@/contexts/ThemeContext'

export function getThemeFromDOM(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';

  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function ThemeToggle() {
  const ctx = useContext(ThemeContext);
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(() => getThemeFromDOM());
  const theme = ctx ? ctx.theme : localTheme;

  useEffect(() => {
    if (!ctx) setLocalTheme(getThemeFromDOM());
  }, [ctx]);

  const handleClick = useCallback(() => {
    if (ctx) {
      ctx.toggleTheme();

      return;
    }

    const next = getThemeFromDOM() === 'light' ? 'dark' : 'light';

    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('theme', next);
    }
    catch (_) { }
    setLocalTheme(next);
  }, [ctx]);
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleClick()
      }}
      className="rounded-md p-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-110"
      aria-label="Alternar tema"
      title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-gray-600" />
      ) : (
        <Sun size={20} className="text-yellow-400" />
      )}
    </button>
  )
}