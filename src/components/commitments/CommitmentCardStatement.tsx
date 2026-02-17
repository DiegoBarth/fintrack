import { numberToCurrency } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { Wallet } from 'lucide-react'

interface Props {
   cardName: string
   totalStatement: number
   onPayStatement: () => void | Promise<void>
   isPaying: boolean
   allPaid?: boolean
}

/**
 * Shows the total statement for the selected card and a button to pay all displayed installments.
 * After paying, the value stays and the button shows "Pago" (disabled).
 */
export function CommitmentCardStatement({
   cardName,
   totalStatement,
   onPayStatement,
   isPaying,
   allPaid = false,
}: Props) {
   return (
      <div
         className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm"
         role="region"
         aria-label={`Fatura do cartão ${cardName}`}
      >
         <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
               <Wallet className="h-5 w-5" />
            </div>
            <div>
               <p className="text-sm font-medium text-muted-foreground">
                  Fatura {cardName}
               </p>
               <p className="text-xl font-bold text-foreground">
                  {numberToCurrency(totalStatement)}
               </p>
            </div>
         </div>
         <Button
            onClick={onPayStatement}
            disabled={isPaying || allPaid}
            className={
               allPaid
                  ? 'rounded-full bg-muted text-muted-foreground border border-border shrink-0 cursor-default'
                  : 'rounded-full bg-green-600 hover:bg-green-700 text-white border-0 shrink-0'
            }
         >
            {isPaying ? 'Pagando…' : allPaid ? 'Pago' : 'Pagar fatura'}
         </Button>
      </div>
   )
}