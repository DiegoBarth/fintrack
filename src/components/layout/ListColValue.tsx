import { ReactNode } from 'react'

export function ListColValue({ children }: { children: ReactNode }) {
   return (
      <div className="col-span-2 text-right font-semibold">
         {children}
      </div>
   )
}