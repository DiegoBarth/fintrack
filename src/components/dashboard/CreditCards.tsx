import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CreditCardSummary } from '@/types/Dashboard'
import { numberToCurrency } from '@/utils/formatters'
import { BASE_PATH, SWIPE_MIN_DISTANCE_PX } from '@/config/constants'

interface Props {
  cards: CreditCardSummary[]
}

export default function CreditCards({ cards }: Props) {
  const [active, setActive] = useState(0)
  const [startX, setStartX] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  if (!cards.length) return null

  function getStyle(index: number) {
    const pos = index - active
    const centerBase = 'translateX(-50%)'

    if (pos === 0) {
      return {
        transform: `${centerBase} scale(1)`,
        opacity: 1,
        zIndex: 30,
      }
    }

    if (pos === -1 || pos === 1) {
      return {
        transform: `translateX(${pos * 240}px) ${centerBase} translateY(-25px) scale(0.75)`,
        opacity: 0.6,
        zIndex: 20,
      }
    }

    return {
      transform: `${centerBase} scale(0.5)`,
      opacity: 0,
      pointerEvents: 'none' as const,
      zIndex: 10
    }
  }

  const handleStart = (clientX: number) => {
    setStartX(clientX)
    setIsDragging(true)
  }

  const handleMove = (clientX: number) => {
    if (!isDragging || startX === null) return

    const diff = startX - clientX

    if (Math.abs(diff) > SWIPE_MIN_DISTANCE_PX) {
      if (diff > 0 && active < cards.length - 1) {
        setActive(prev => prev + 1)
        handleEnd()
      } else if (diff < 0 && active > 0) {
        setActive(prev => prev - 1)
        handleEnd()
      }
    }
  }

  const handleEnd = () => {
    setIsDragging(false)
    setStartX(null)
  }

  return (
    <section
      className="
        relative mt-2 h-[420px] sm:h-[460px] overflow-hidden select-none
        animate-[fadeUp_.4s_ease-out_forwards]
      "
    >
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cartões</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-300">
            {active + 1} / {cards.length}
          </span>
        </div>
      </div>

      <div
        className="relative mx-auto h-full w-full max-w-4xl touch-pan-y"
        onTouchStart={(e) => handleStart(e.targetTouches[0].clientX)}
        onTouchMove={(e) => handleMove(e.targetTouches[0].clientX)}
        onTouchEnd={handleEnd}

        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        {cards.map((c, index) => (
          <div
            key={c.cardName}
            className={`
                     absolute left-1/2 
                     top-6 sm:top-10
                     w-[75%] sm:w-80
                     rounded-xl bg-white dark:bg-zinc-900 p-4
                     shadow-2xl
                     transition-all duration-500 ease-out
                     ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                  `}
            style={getStyle(index)}
            onClick={() => !isDragging && setActive(index)}
          >
            <img
              src={`${BASE_PATH}cards/${c.image}.jpg`}
              alt={c.cardName}
              className="mb-3 h-32 sm:h-44 w-full rounded-lg object-contain pointer-events-none bg-white dark:bg-zinc-900"
            />

            <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-lg">{c.cardName}</h3>

            <div className="mt-2 space-y-1 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-zinc-800/50 pb-1">
                <span className="text-gray-900 dark:text-gray-100">Fatura:</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {numberToCurrency(c.statementTotal)}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-900 dark:text-gray-100">Disponível:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                  {numberToCurrency(c.availableLimit)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block">
        <button
          onClick={() => setActive(a => Math.max(0, a - 1))}
          disabled={active === 0}
          className="absolute top-1/2 left-10 -translate-y-1/2 z-50 bg-white/90 dark:bg-gray-800/90 p-3 rounded-full
                  shadow-xl hover:bg-white dark:hover:bg-gray-700 hover:scale-110 disabled:opacity-0
                  disabled:pointer-events-none transition-all duration-200"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <button
          onClick={() => setActive(a => Math.min(cards.length - 1, a + 1))}
          disabled={active === cards.length - 1}
          className="absolute top-1/2 right-10 -translate-y-1/2 z-50 bg-white/90 dark:bg-gray-800/90 p-3 rounded-full
                  shadow-xl hover:bg-white dark:hover:bg-gray-700 hover:scale-110 disabled:opacity-0
                  disabled:pointer-events-none transition-all duration-200"
        >
          <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="relative flex items-center justify-center w-8 h-8"
            aria-label={`Ir para cartão ${i + 1}`}
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${i === active
                ? 'w-6 bg-blue-600 dark:bg-blue-500'
                : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}