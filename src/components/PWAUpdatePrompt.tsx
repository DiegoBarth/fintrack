import { useRegisterSW } from 'virtual:pwa-register/react'

/** Interval to check for service worker updates (1 hour). */
const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000

/**
 * Registers the PWA service worker and shows a banner when a new version is available.
 * Note: the prompt only appears in production build; in dev the SW is usually not active.
 */
export default function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (import.meta.env.DEV) {
        console.log('SW registered (dev):', registration?.scope)
        return
      }
      // Periodic check so the "new version" prompt can appear without user refreshing.
      if (registration) {
        setInterval(() => registration.update(), SW_UPDATE_INTERVAL_MS)
      }
    },
    onRegisterError(error) {
      console.warn('SW registration error:', error)
    },
  })

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[9999] md:left-auto md:right-4 md:max-w-sm pointer-events-auto">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-900 dark:bg-gray-700 text-white p-4 shadow-lg border border-gray-700 dark:border-gray-600">
        <span className="text-sm">Nova versão disponível!</span>
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Depois
          </button>
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-500 hover:bg-indigo-600"
          >
            Atualizar
          </button>
        </div>
      </div>
    </div>
  )
}