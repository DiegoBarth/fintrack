import { ReactNode } from 'react'

export function ListColDescription({ children }: { children: ReactNode }) {
   return (
      <div className="col-span-4 font-medium">
         {children}
      </div>
   )
}