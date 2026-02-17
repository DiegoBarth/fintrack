import { memo, useMemo } from 'react'
import type { Commitment } from '@/types/Commitment'
import { CommitmentList } from '@/components/commitments/CommitmentList'
import { numberToCurrency } from '@/utils/formatters'
import { CARDS } from '@/config/constants'

interface Props {
   commitments: Commitment[]
   onSelect: (commitment: Commitment) => void
   showStatementInGroupHeaders?: boolean
}

type TypeKey = 'Fixo' | 'Variável' | 'Cartão'

interface Group {
   type: TypeKey
   card?: string
   items: Commitment[]
}

const TYPE_ORDER: TypeKey[] = ['Fixo', 'Variável', 'Cartão']

/**
 * Groups commitments by type (Fixo, Variável, Cartão) and within Cartão by card.
 * Renders section headers and a CommitmentList per group.
 */
export const CommitmentListGrouped = memo(function CommitmentListGrouped({
   commitments,
   onSelect,
   showStatementInGroupHeaders = false,
}: Props) {
   const groups = useMemo(() => {
      const byType: Record<TypeKey, Commitment[]> = {
         Fixo: [],
         Variável: [],
         Cartão: [],
      }

      for (const c of commitments) {
         const type = (c.type === 'Fixo' || c.type === 'Variável' || c.type === 'Cartão')
            ? c.type
            : 'Variável'
         if (byType[type]) byType[type].push(c)
      }

      const result: Group[] = []

      for (const type of TYPE_ORDER) {
         const items = byType[type]
         if (items.length === 0) continue

         if (type !== 'Cartão') {
            result.push({ type, items })
            continue
         }

         const byCard: Record<string, Commitment[]> = {}
         for (const c of items) {
            const card = c.card || 'Outros'
            if (!byCard[card]) byCard[card] = []
            byCard[card].push(c)
         }

         for (const card of CARDS) {
            const cardItems = byCard[card]
            if (cardItems?.length) result.push({ type: 'Cartão', card, items: cardItems })
         }
         if (byCard['Outros']?.length) {
            result.push({ type: 'Cartão', card: 'Outros', items: byCard['Outros'] })
         }
      }

      return result
   }, [commitments])

   if (groups.length === 0) {
      return (
         <CommitmentList
            commitments={[]}
            onSelect={() => {}}
         />
      )
   }

   return (
      <div className="space-y-6">
         {groups.map((group) => {
            const isCardGroup = group.type === 'Cartão' && group.card
            const totalStatement =
               showStatementInGroupHeaders && isCardGroup
                  ? group.items.reduce((sum, c) => sum + Number(c.amount), 0)
                  : 0

            return (
               <section
                  key={group.card ? `${group.type}-${group.card}` : group.type}
                  aria-labelledby={`group-${group.type}-${group.card ?? ''}`}
               >
                  <h2
                     id={`group-${group.type}-${group.card ?? ''}`}
                     className="text-sm font-semibold text-muted-foreground mb-2 px-0.5 flex flex-wrap items-baseline justify-between gap-2"
                  >
                     <span>
                        {group.card ? `${group.type} • ${group.card}` : group.type}
                     </span>
                     {showStatementInGroupHeaders && isCardGroup && (
                        <span className="font-bold text-foreground text-base">
                           {numberToCurrency(totalStatement)}
                        </span>
                     )}
                  </h2>
                  <CommitmentList
                     commitments={group.items}
                     onSelect={onSelect}
                  />
               </section>
            )
         })}
      </div>
   )
})
