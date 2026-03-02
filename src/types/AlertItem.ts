import type { Commitment } from './Commitment'

export type AlertItem =
  | { kind: 'commitment'; commitment: Commitment }
  | { kind: 'cardGroup'; card: string; commitments: Commitment[]; totalAmount: number }
