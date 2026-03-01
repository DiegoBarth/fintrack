import type { Commitment } from './Commitment'

export type AlertItem =
  | { kind: 'commitment'; commitment: Commitment }
  | { kind: 'cardGroup'; card: string; commitments: Commitment[]; totalAmount: number }

export function groupCommitmentsForAlerts(commitments: Commitment[]): AlertItem[] {
  const cardMap = new Map<string, Commitment[]>()
  const items: AlertItem[] = []

  for (const c of commitments) {
    if (c.type === 'Cartão' && c.card) {
      const list = cardMap.get(c.card) ?? []
      list.push(c)
      cardMap.set(c.card, list)
    } else {
      items.push({ kind: 'commitment', commitment: c })
    }
  }

  for (const [card, list] of cardMap) {
    const totalAmount = list.reduce((sum, c) => sum + Number(c.amount), 0)
    items.push({ kind: 'cardGroup', card, commitments: list, totalAmount })
  }

  return items
}
