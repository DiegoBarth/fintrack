import { cn } from '@/lib/utils'
import { CARDS } from '@/config/constants'

type CardFilterValue = string | null

interface Props {
   value: CardFilterValue
   onChange: (card: CardFilterValue) => void
   className?: string
}

/**
 * Filter chips for commitments by card (Bradesco, Itaú, Mercado Pago).
 * "Todos" shows all commitments; selecting a card shows only that card's installments.
 */
export function CommitmentCardFilter({ value, onChange, className }: Props) {
   return (
      <div
         className={cn(
            'flex flex-wrap items-center gap-2',
            className
         )}
         role="group"
         aria-label="Filtrar por cartão"
      >
         <FilterChip
            label="Todos"
            selected={value === null}
            onClick={() => onChange(null)}
         />
         {CARDS.map((card) => (
            <FilterChip
               key={card}
               label={card}
               selected={value === card}
               onClick={() => onChange(card)}
            />
         ))}
      </div>
   )
}

function FilterChip({
   label,
   selected,
   onClick,
}: {
   label: string
   selected: boolean
   onClick: () => void
}) {
   return (
      <button
         type="button"
         onClick={onClick}
         className={cn(
            'rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200',
            'border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            selected
               ? 'bg-primary text-primary-foreground border-primary shadow-sm'
               : 'bg-background border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent'
         )}
      >
         {label}
      </button>
   )
}
