import { ReactNode } from 'react'
import { ListItemLayout } from './ListItemLayout'

interface Props {
   children: ReactNode
   onClick?: () => void
   cols?: number
   variant?: 'default' | 'success' | 'danger'
}

export function ListItemRowDesktop({ children, onClick, variant }: Props) {
   return (
      <ListItemLayout
         onClick={onClick}
         variant={variant}
         className={`col-span-12 grid grid-cols-12 items-center p-4 hover:shadow-md`}
      >
         {children}
      </ListItemLayout>
   )
}