import { Fragment, type ReactNode } from 'react'
import { Inbox } from 'lucide-react'

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
         <div className="
            flex flex-col items-center justify-center p-12 mt-4 
            border-2 border-dashed rounded-2xl transition-colors
            /* Light Mode */
            bg-slate-50 border-slate-300
            /* Dark Mode */
            dark:bg-slate-900/40 dark:border-slate-800
         ">
            <div className="
               p-4 rounded-full mb-4
               /* Light Mode */
               bg-emerald-100 
               /* Dark Mode */
               dark:bg-emerald-500/10 
            ">
               <Inbox className="w-12 h-12 text-emerald-600 dark:text-emerald-500 opacity-90" />
            </div>

            <h3 className="text-xl text-center font-bold text-slate-800 dark:text-slate-100 mb-2">
               {emptyText}
            </h3>

            <p className="text-slate-500 dark:text-slate-400 text-center max-w-[280px] mb-8 leading-relaxed">
               Parece que você ainda não tem registros por aqui. Que tal começar agora?
            </p>
         </div>
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