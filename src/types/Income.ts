export interface Income {
   rowIndex: number
   description: string
   expectedDate: string
   receivedDate?: string | null
   referenceMonth: string
   amount: number | string
}