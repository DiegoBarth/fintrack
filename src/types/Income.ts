export interface Income {
   rowIndex: number
   description: string
   expectedDate: string
   receivedDate?: string | null
   amount: number | string
}