import { ReactNode } from 'react'

export function ListColStatus({ children }: { children: ReactNode }) {
   return (
      <div className="col-span-1 text-sm font-medium text-right">
         {children}
      </div>
   )
}