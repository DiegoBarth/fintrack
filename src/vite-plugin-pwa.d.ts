declare module 'virtual:pwa-register/react' {
  import { Dispatch, SetStateAction } from 'react'

  export interface UseRegisterSWOptions {
    onRegistered?: (registration?: ServiceWorkerRegistration) => void
    onRegisterError?: (error: any) => void
  }

  export interface UseRegisterSWResult {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>]
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }

  export function useRegisterSW(
    options?: UseRegisterSWOptions
  ): UseRegisterSWResult
}