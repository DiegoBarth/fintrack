import { Fragment, type ReactNode } from 'react'

interface ListLayoutProps<T> {
   itens: T[]
   emptyText: string
   keyExtractor: (item: T) => string | number
   renderMobileItem: (item: T) => ReactNode
   renderDesktopItem: (item: T) => ReactNode
   mobileClassName?: string
   desktopClassName?: string
}

export function ListLayout<T>({
   itens,
   emptyText,
   keyExtractor,
   renderMobileItem,
   renderDesktopItem,
   mobileClassName = 'space-y-2 sm:hidden',
   desktopClassName = 'hidden sm:grid grid-cols-12 gap-3',
}: ListLayoutProps<T>) {
   if (itens.length === 0) {
      return (
         <p className="text-sm text-muted-foreground">
            {emptyText}
         </p>
      )
   }

   return (
      <>
         <div className={mobileClassName}>
            {itens.map(item => (
               <Fragment key={keyExtractor(item)}>
                  {renderMobileItem(item)}
               </Fragment>
            ))}
         </div>

         <div className={desktopClassName}>
            {itens.map(item => (
               <Fragment key={keyExtractor(item)}>
                  {renderDesktopItem(item)}
               </Fragment>
            ))}
         </div>
      </>
   )
}