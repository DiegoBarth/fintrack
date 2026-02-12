import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
   const { theme, toggleTheme } = useTheme()

   return (
      <button
         onClick={toggleTheme}
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