import { Outlet } from 'react-router-dom'
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation'
import { SwipeArrow } from '../ui/SwipeArrow'

export function SwipeLayout() {
   const { handlers, arrow } = useSwipeNavigation()

   return (
      <div {...handlers} className="relative min-h-screen overflow-x-hidden bg-gray-50 dark:bg-gray-900">
         <SwipeArrow direction={arrow} />

         <main>
            <Outlet />
         </main>
      </div>
   )
}