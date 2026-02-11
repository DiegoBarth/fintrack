import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'

interface Props {
   direction: 'left' | 'right' | 'up' | null
}

export function SwipeArrow({ direction }: Props) {
   return (
      <AnimatePresence>
         {direction && (
            <motion.div
               key={direction}
               initial={{
                  opacity: 0,
                  x:
                     direction === 'left'
                        ? -24
                        : direction === 'right'
                           ? 24
                           : 0,
                  y: direction === 'up' ? -24 : 0,
               }}
               animate={{ opacity: 0.8, x: 0, y: 0 }}
               exit={{
                  opacity: 0,
                  x:
                     direction === 'left'
                        ? -24
                        : direction === 'right'
                           ? 24
                           : 0,
                  y: direction === 'up' ? -24 : 0,
               }}
               transition={{ duration: 0.18, ease: 'easeOut' }}
               className={`
                  fixed z-[9999] pointer-events-none
                  ${direction === 'up'
                     ? 'top-4 left-[45%] -translate-x-1/2'
                     : 'top-1/2 -translate-y-1/2'
                  }
                  ${direction === 'left' ? 'left-4' : ''}
                  ${direction === 'right' ? 'right-4' : ''}
               `}
            >
               {direction === 'left' && (
                  <ChevronLeft
                     size={36}
                     className="text-muted-foreground drop-shadow-sm"
                  />
               )}

               {direction === 'right' && (
                  <ChevronRight
                     size={36}
                     className="text-muted-foreground drop-shadow-sm"
                  />
               )}

               {direction === 'up' && (
                  <ChevronUp
                     size={36}
                     className="text-muted-foreground drop-shadow-sm"
                  />
               )}
            </motion.div>
         )}
      </AnimatePresence>
   )
}