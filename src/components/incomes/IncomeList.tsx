import { memo, useCallback } from 'react'
import { ListLayout } from '@/components/layout/ListLayout'
import { ListItemLayout } from '@/components/layout/ListItemLayout'
import type { Income } from '@/types/Income'
import { dateBRToISO, numberToCurrency } from '@/utils/formatters'
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

function isReceivedOutOfReference(income: Income) {
   if (!income.receivedDate || !income.referenceMonth) return false

   const received = new Date(dateBRToISO(income.receivedDate))
   const [refYear, refMonth] = income.referenceMonth.split('-')

   return (
      received.getFullYear() !== Number(refYear) ||
      received.getMonth() + 1 !== Number(refMonth)
   )
}

/**
 * Income list with performance optimizations.
 */
export const IncomeList = memo(function IncomeList({ incomes, onSelect }: Props) {

   const renderMobileItem = useCallback((income: Income) => {
      const received = !!income.receivedDate
      const outOfReference = isReceivedOutOfReference(income)

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
                  <div className="flex flex-col text-xs min-h-[32px] justify-center gap-1">
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

                     {outOfReference && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                           Pago fora do mês de referência
                        </span>
                     )}
                  </div>
               }
               right={
                  <div className="flex flex-col items-end gap-1">
                     <span
                        className={
                           received
                              ? 'text-green-600 dark:text-green-400 font-medium'
                              : 'text-blue-600 dark:text-blue-400 font-medium'
                        }
                     >
                        {received ? 'Recebido' : 'Em aberto'}
                     </span>

                     {outOfReference && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-medium">
                           Fora do mês
                        </span>
                     )}
                  </div>
               }
            />
         </ListItemLayout>
      )
   }, [onSelect])

   const renderDesktopItem = useCallback((income: Income) => {
      const received = !!income.receivedDate
      const outOfReference = isReceivedOutOfReference(income)

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
               <span className={received ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}>
                  {dateText}
               </span>

               {outOfReference && (
                  <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                     Pago fora do mês de referência
                  </div>
               )}
            </ListColMuted>

            <ListColValue>
               {numberToCurrency(income.amount)}
            </ListColValue>

            <div className="col-span-2 text-right flex justify-end items-center gap-2">
               <span
                  className={
                     received
                        ? 'text-green-600 dark:text-green-400 font-semibold'
                        : 'text-blue-600 dark:text-blue-400 font-semibold'
                  }
               >
                  {received ? 'Recebido' : 'Em aberto'}
               </span>

               {outOfReference && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-medium">
                     Fora do mês
                  </span>
               )}
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