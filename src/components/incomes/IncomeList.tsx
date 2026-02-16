import { memo, useCallback } from 'react'
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

/**
 * Income list with performance optimizations.
 * * Applied Optimizations:
 * - React.memo: Prevents re-renders when props remain unchanged.
 * - useCallback: Memoizes mobile/desktop render functions.
 */
export const IncomeList = memo(function IncomeList({ incomes, onSelect }: Props) {
   const renderMobileItem = useCallback((income: Income) => {
      const received = !!income.receivedDate

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
               left={
                  <div className="flex flex-col text-xs min-h-[32px] justify-center">
                     {income.expectedDate && (
                        <span className="text-blue-700 dark:text-blue-300">
                           Previsto para {income.expectedDate}
                        </span>
                     )}

                     {income.receivedDate ? (
                        <span className="text-green-700 dark:text-green-300">
                           Recebido em {income.receivedDate}
                        </span>
                     ) : (
                        <span className="invisible select-none">Espaçador</span>
                     )}
                  </div>
               }
               right={
                  <div className="flex items-center h-full">
                     <span
                        className={
                           received
                              ? 'text-green-600 dark:text-green-400 font-medium'
                              : 'text-blue-600 dark:text-blue-400 font-medium'
                        }
                     >
                        {received ? 'Recebido' : 'Em aberto'}
                     </span>
                  </div>
               }
            />
         </ListItemLayout>
      )
   }, [onSelect])

   const renderDesktopItem = useCallback((income: Income) => {
      const received = !!income.receivedDate
      const dateText = received
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
               <span className={received ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}>{dateText}</span>
            </ListColMuted>

            <ListColValue>
               {numberToCurrency(income.amount)}
            </ListColValue>

            <div className="col-span-2 text-right">
               <span className={received ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-blue-600 dark:text-blue-400 font-semibold'}>
                  {received ? 'Recebido' : 'Em aberto'}
               </span>
            </div>
         </ListItemRowDesktop>
      )
   }, [onSelect])
   return (
      <ListLayout
         itens={incomes}
         emptyText="Nenhuma receita cadastrada"
         keyExtractor={(income) => income.rowIndex}
         renderMobileItem={renderMobileItem}
         renderDesktopItem={renderDesktopItem}
      />
   )
})