import { ReactNode } from 'react'

interface Props {
   span?: number
   children: ReactNode
}

export function ListColMuted({ span = 3, children }: Props) {
   return (
      <div className={`col-span-${span} text-sm text-muted-foreground`}>
         {children}
      </div>
   )
}