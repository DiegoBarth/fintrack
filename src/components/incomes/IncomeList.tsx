import { ListLayout } from '@/components/layout/ListLayout'
import { ListItemLayout } from '@/components/layout/ListItemLayout'
import type { Income } from '@/types/Income'
import { numberToCurrency } from '@/utils/formatters'
import { ListItemHeaderMobile } from '@/components/layout/ListItemHeaderMobile'
import { ListItemFooterMobile } from '@/components/layout/ListItemFooterMobile'
import { ListColDescription } from '@/components/layout/ListColDescription'
import { ListColMuted } from '@/components/layout/ListColMuted'
import { ListColValue } from '@/components/layout/ListColValue'
import { ListItemRowDesktop } from '@/components/layout/ListItemRowDesktop'

interface Props {
   incomes: Income[]
   onSelect: (income: Income) => void
}

export function IncomeList({ incomes, onSelect }: Props) {
   return (
      <ListLayout
         itens={incomes}
         emptyText="Nenhuma receita cadastrada"
         keyExtractor={(income) => income.rowIndex}

         renderMobileItem={(income) => {
            const received = !!income.receivedDate

            const textoData = received
               ? `Recebido em ${income.receivedDate}`
               : `Previsto para ${income.expectedDate}`

            return (
               <ListItemLayout
                  onClick={() => onSelect(income)}
                  variant={received ? 'success' : 'default'}
                  className="p-3"
               >
                  <ListItemHeaderMobile
                     title={income.description}
                     right={numberToCurrency(income.amount)}
                  />

                  <ListItemFooterMobile
                     left={textoData}
                     right={
                        <span className={received ? 'text-green-600' : 'text-blue-500'}>
                           {received ? 'Recebido' : 'Em aberto'}
                        </span>
                     }
                  />
               </ListItemLayout>
            )
         }}

         renderDesktopItem={(income) => {
            const received = !!income.receivedDate

            const textoData = received
               ? `Recebido em ${income.receivedDate}`
               : `Previsto para ${income.expectedDate}`

            return (
               <ListItemRowDesktop
                  onClick={() => onSelect(income)}
                  variant={received ? 'success' : 'default'}
               >
                  <ListColDescription>
                     {income.description}
                  </ListColDescription>

                  <ListColMuted span={4}>
                     {textoData}
                  </ListColMuted>

                  <ListColValue>
                     {numberToCurrency(income.amount)}
                  </ListColValue>

                  <div className="col-span-2 text-right font-medium">
                     <span className={received ? 'text-green-600' : 'text-blue-500'}>
                        {received ? 'Recebido' : 'Em aberto'}
                     </span>
                  </div>
               </ListItemRowDesktop>
            )
         }}
      />
   )
}