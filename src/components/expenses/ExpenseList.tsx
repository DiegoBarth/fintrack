import { ListLayout } from '@/components/layout/ListLayout'
import { ListItemLayout } from '@/components/layout/ListItemLayout'
import type { Expense } from '@/types/Expense'
import { numberToCurrency } from '@/utils/formatters'
import { ListItemHeaderMobile } from '@/components/layout/ListItemHeaderMobile'
import { ListItemFooterMobile } from '@/components/layout/ListItemFooterMobile'
import { ListItemRowDesktop } from '@/components/layout/ListItemRowDesktop'
import { ListColDescription } from '@/components/layout/ListColDescription'
import { ListColMuted } from '@/components/layout/ListColMuted'
import { ListColStatus } from '@/components/layout/ListColStatus'
import { ListColValue } from '@/components/layout/ListColValue'

interface Props {
   expenses: Expense[]
   onSelect: (expense: Expense) => void
}

export function ExpenseList({ expenses, onSelect }: Props) {
   return (
      <ListLayout
         itens={expenses}
         emptyText="Nenhum gasto cadastrado"
         keyExtractor={(expense) => expense.rowIndex}

         renderMobileItem={(expense) => (
            <ListItemLayout
               onClick={() => onSelect(expense)}
               className="p-3"
            >
               <ListItemHeaderMobile
                  title={expense.description}
                  right={
                     <span className="text-red-600">
                        {numberToCurrency(expense.amount)}
                     </span>
                  }
               />

               <ListItemFooterMobile
                  left={`Pago em ${expense.paymentDate} • ${expense.category}`}
                  right={
                     <span className="text-green-600">
                        Pago
                     </span>
                  }
               />
            </ListItemLayout>
         )}

         renderDesktopItem={(expense) => (
            <ListItemRowDesktop
               onClick={() => onSelect(expense)}
            >
               <ListColDescription>
                  {expense.description}
               </ListColDescription>

               <ListColMuted span={2}>
                  {expense.category ?? '-'}
               </ListColMuted>

               <ListColMuted span={3}>
                  Pago em {expense.paymentDate}
               </ListColMuted>

               <ListColValue>
                  <span className="text-red-600">
                     {numberToCurrency(expense.amount)}
                  </span>
               </ListColValue>

               <ListColStatus>
                  <span className="text-green-600">
                     Pago
                  </span>
               </ListColStatus>
            </ListItemRowDesktop>
         )}
      />
   )
}