import { ReactNode } from 'react'

interface Props {
   left: ReactNode
   right: ReactNode
}

export function ListItemFooterMobile({ left, right }: Props) {
   return (
      <div className="mt-1 flex items-center justify-between text-xs">
         <span className="text-muted-foreground">
            {left}
         </span>

         <span className="font-medium">
            {right}
         </span>
      </div>
   )
}