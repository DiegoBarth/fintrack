import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import { SWIPE_ROUTES, EDGE_ZONE } from '@/config/constants'

export function useSwipeNavigation() {
   const navigate = useNavigate()
   const location = useLocation()
   const [arrow, setArrow] = useState<'left' | 'right' | 'up' | null>(null)

   const currentIndex = SWIPE_ROUTES.indexOf(location.pathname)

   const handlers = useSwipeable({
      onSwiping: (e) => {
         const screenWidth = window.innerWidth

         const startedOnLeft = e.initial[0] < EDGE_ZONE
         const startedOnRight = e.initial[0] > screenWidth - EDGE_ZONE

         if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            if (e.deltaX > 50 && startedOnLeft && currentIndex > 0) {
               setArrow('left')
               return
            }

            if (e.deltaX < -50 && startedOnRight && currentIndex < SWIPE_ROUTES.length - 1) {
               setArrow('right')
               return
            }
         }

         if (e.deltaY > 50 && window.scrollY === 0) {
            setArrow('up')
         } else if (arrow === 'up') {
            setArrow(null)
         }
      },

      onSwipedLeft: (e) => {
         setArrow(null)
         const startedOnRight = e.initial[0] > window.innerWidth - EDGE_ZONE
         if (startedOnRight && currentIndex < SWIPE_ROUTES.length - 1) {
            navigate(SWIPE_ROUTES[currentIndex + 1])
         }
      },

      onSwipedRight: (e) => {
         setArrow(null)
         const startedOnLeft = e.initial[0] < EDGE_ZONE
         if (startedOnLeft && currentIndex > 0) {
            navigate(SWIPE_ROUTES[currentIndex - 1])
         }
      },

      onSwipedDown: () => {
         if (window.scrollY === 0) {
            setArrow(null)
            window.location.reload()
         }
      },

      onTouchEndOrOnMouseUp: () => setArrow(null),
      preventScrollOnSwipe: true,
      trackMouse: true,
      delta: 10,
   })

   return { handlers, arrow }
}