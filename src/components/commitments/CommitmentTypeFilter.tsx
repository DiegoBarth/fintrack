import { cn } from '@/lib/utils'
import { COMMITMENT_TYPES } from '@/config/constants'

export type CommitmentTypeFilterValue = 'Fixo' | 'Variável' | 'Cartão' | null

interface Props {
   value: CommitmentTypeFilterValue
   onChange: (type: CommitmentTypeFilterValue) => void
   className?: string
}

/**
 * Filter chips for commitment type: Todos, Fixo, Variável, Cartão.
 */
export function CommitmentTypeFilter({ value, onChange, className }: Props) {
   return (
      <div
         className={cn('flex flex-wrap items-center gap-2', className)}
         role="group"
         aria-label="Filtrar por tipo"
      >
         <FilterChip
            label="Todos"
            selected={value === null}
            onClick={() => onChange(null)}
         />
         {COMMITMENT_TYPES.map((type) => (
            <FilterChip
               key={type}
               label={type}
               selected={value === type}
               onClick={() => onChange(type as CommitmentTypeFilterValue)}
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
