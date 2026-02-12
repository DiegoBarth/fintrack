import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
   prompt: () => Promise<void>
   userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPWA() {
   const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
   const [showInstallPrompt, setShowInstallPrompt] = useState(false)

   useEffect(() => {
      const handler = (e: Event) => {
         e.preventDefault()
         setDeferredPrompt(e as BeforeInstallPromptEvent)

         const dismissed = localStorage.getItem('pwa-install-dismissed')
         if (!dismissed) {
            setShowInstallPrompt(true)
         }
      }

      window.addEventListener('beforeinstallprompt', handler)

      if (window.matchMedia('(display-mode: standalone)').matches) {
         setShowInstallPrompt(false)
      }

      return () => window.removeEventListener('beforeinstallprompt', handler)
   }, [])

   const handleInstallClick = async () => {
      if (!deferredPrompt) return

      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
         setShowInstallPrompt(false)
      }

      setDeferredPrompt(null)
   }

   const handleDismiss = () => {
      setShowInstallPrompt(false)
      localStorage.setItem('pwa-install-dismissed', 'true')
   }

   if (!showInstallPrompt) return null

   return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
         <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 p-4 shadow-lg">
            <div className="flex items-start justify-between gap-3">
               <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                     Instalar Aplicativo
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                     Instale o app para acesso rápido e uso offline
                  </p>
                  <button
                     onClick={handleInstallClick}
                     className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                     <Download size={16} />
                     Instalar
                  </button>
               </div>
               <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Fechar"
               >
                  <X size={20} />
               </button>
            </div>
         </div>
      </div>
   )
}