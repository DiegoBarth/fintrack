import { ReactNode } from 'react'

interface Props {
   title: ReactNode
   right: ReactNode
}

export function ListItemHeaderMobile({ title, right }: Props) {
   return (
      <div className="flex justify-between items-start">
         <div className="font-medium">
            {title}
         </div>

         <div className="font-semibold">
            {right}
         </div>
      </div>
   )
}