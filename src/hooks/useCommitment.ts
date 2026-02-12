import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listCommitments, createCommitment, createCard, updateCommitment, deleteCommitment } from '@/api/endpoints/commitment'
import { useApiError } from '@/hooks/useApiError'
import { updateCacheAfterCreateCommitment, updateCacheAfterEditCommitment, updateCacheAfterDeleteCommitment } from '@/services/commitmentCacheService'
import { dateBRToISO, getMonthAndYear } from '@/utils/formatters'
import type { Commitment } from '@/types/Commitment'

/**
 * Hook to manage financial commitments/obligations
 * * Responsibilities:
 * - Fetch commitments for the period
 * - Fetch alert commitments (nearing due date)
 * - Create, update, and delete commitments
 * - Synchronize multiple query caches after mutations
 * - Centralize errors via useApiError
 * * "Alerts" Concept:
 * - Fetches commitments from all months of the year
 * - Filters only those close to their due date
 * - Appears in toast notifications
 * * @param month - Month in "1"-"12" format or "all" for alerts
 * @param year - Year as a string (e.g., "2025")
 * @param key - Custom cache key (e.g., "alerts")
 * * @returns Object containing data, mutations, and states
 * * @example
 * const { commitments, create, update } = useCommitment('2', '2025');
 */
export function useCommitment(month: string, year: string, key?: string | null) {
   const queryClient = useQueryClient()
   const { handleError } = useApiError()

   // Query key: ['commitments', '2', '2025'] ou ['commitments', 'alerts', '2025']
   const queryKey = ['commitments', key ?? month, year]

   // ===== Query: List Monthly Commitments =====
   /**
    * Query that fetches commitments ONLY for the selected month/year
    * * Usage: Display on the current page (Home, commitments list)
    * * Strategy:
    * - staleTime: Infinity = data never expires, only invalidated by mutations
    * - retry: 1 = attempts to reconnect once in case of network error
    * - queryKey changes when month/year change = automatic new fetch
    */
   const { data: commitments = [], isLoading, isError } = useQuery({
      queryKey: ['commitments', month, year],
      queryFn: () => listCommitments(month, String(year)),
      staleTime: Infinity,
      retry: 1
   })

   // ===== Query: Alert Commitments (FULL YEAR) =====
   /**
    * SEPARATE query that fetches commitments from ALL months of the year
    * * Usage: Display alerts regardless of which month is currently selected
    * * Behavior:
    * - Fetches with month='all' = returns all commitments for the year
    * - Filters only commitments nearing due date (next 7 days or overdue)
    * - Unpaid (paymentDate is null)
    * * Example:
    * - User in January viewing January data
    * - But there is an alert for a commitment due in February
    * - This alert appears on the Home screen (Alerts.tsx)
    * * Separate QueryKey: 'alert-commitments' never conflicts with the monthly query
    * Allows both queries to run independently
    */
   const { data: alertCommitments = [] } = useQuery({
      queryKey: ['alert-commitments', year], // Different key!
      queryFn: () => listCommitments('all', String(year)), // Search ALL year
      staleTime: Infinity,
      retry: 1
   })

   // ===== Mutation: Create Commitment =====
   /**
    * Supports creating fixed (monthly) or variable (one-time) commitments
    * * Fixed: If months=12, creates an entry for each month of the year
    * Variable: Creates only for the specified month
    * * Cache sync strategy:
    * - onSuccess: Calls insertIntoCache() which updates ALL relevant caches
    * - Ensures the new item appears in the dashboard, list, alerts, etc.
    */
   const createMutation = useMutation({
      mutationFn: (newCommitment: {
         type: 'Fixed' | 'Variable',
         description: string,
         category: string,
         amount: number,
         dueDate: string,
         months?: number
      }) =>
         createCommitment(newCommitment),
      onSuccess: (newCommitments: Commitment[]) => {
         // Inserts new records into ALL relevant caches
         newCommitments.forEach(commitment => {
            const { month: regisMonth, year: regisYear } = getMonthAndYear(commitment.dueDate)
            updateCacheAfterCreateCommitment(queryClient, commitment, regisMonth, regisYear)

            // Update alerts cache
            queryClient.setQueryData<Commitment[]>(
               ['alert-commitments', year],
               old => old ? [...old, commitment] : [commitment]
            )
         })
      },
      onError: (error) => {
         handleError(error)
      }
   })

   // ===== Mutation: Create Card =====
   /**
    * Creates a credit card commitment
    * Similar to createMutation but with specific types
    */
   const createCardMutation = useMutation({
      mutationFn: (newCommitment: Omit<Commitment, 'rowIndex'>) => createCard(newCommitment),
      onSuccess: (newCommitments: Commitment[]) => {
         newCommitments.forEach(commitment => {
            const { month: regisMonth, year: regisYear } = getMonthAndYear(commitment.dueDate)
            updateCacheAfterCreateCommitment(queryClient, commitment, regisMonth, regisYear)

            // Update cache alerts
            queryClient.setQueryData<Commitment[]>(
               ['alert-commitments', year],
               old => old ? [...old, commitment] : [commitment]
            )
         })
      },
      onError: (error) => {
         handleError(error)
      }
   })

   // ===== Mutation: Update Commitment =====
   /**
    * Updates an existing commitment (mark as paid)
    * * Parameters:
    * - rowIndex: Unique commitment ID
    * - value: New value (partial payment supported)
    * - paymentDate: Date when it was paid
    * - scope: 'single' to update only this one, omit for series
    * * Cache sync strategy:
    * - TWO setQueryData: one for the period, another for alerts
    * - Both need to be updated since alerts fetch all months
    */
   const updateMutation = useMutation({
      mutationFn: (data: {
         rowIndex: number
         amount: number
         paymentDate: string
         scope?: 'single'
      }) => updateCommitment(data),
      onSuccess: (_data, variables) => {
         const oldCommitment = commitments.find(c => c.rowIndex === variables.rowIndex)

         if (oldCommitment) {
            updateCacheAfterEditCommitment(queryClient, oldCommitment, variables, month, year)

            // Update alerts cache
            queryClient.setQueryData<Commitment[]>(
               ['alert-commitments', year],
               old =>
                  old?.map(r =>
                     r.rowIndex === variables.rowIndex
                        ? {
                           ...r,
                           valor: variables.amount,
                           dataPagamento: dateBRToISO(variables.paymentDate)
                        }
                        : r
                  ) ?? []
            )
         }
      },
      onError: (error) => {
         handleError(error)
      }
   })

   // ===== Mutation: Delete Commitment =====
   /**
    * Removes commitment from the system
    * * Cache sync strategy:
    * - Removes from TWO caches: current period and alerts
    * - Uses filter to remove item with specific rowIndex
    */
   const removeMutation = useMutation({
      mutationFn: (rowIndex: number) => deleteCommitment(rowIndex),
      onSuccess: (_data, rowIndex) => {
         const deletedCommitment = commitments.find(c => c.rowIndex === rowIndex)

         if (deletedCommitment) {
            updateCacheAfterDeleteCommitment(queryClient, deletedCommitment, month, year)

            // Update alerts cache
            queryClient.setQueryData<Commitment[]>(
               ['alert-commitments', year],
               old => old?.filter(r => r.rowIndex !== rowIndex) ?? []
            )
         }
      },
      onError: (error) => {
         handleError(error)
      }
   })

   return {
      commitments,           // Array of commitments for the period
      alertCommitments,      // Array of commitments nearing their due date
      isLoading,             // True while fetching data
      isError,               // True if the request failed
      create: createMutation.mutateAsync,
      createCard: createCardMutation.mutateAsync,
      update: updateMutation.mutateAsync,
      remove: removeMutation.mutateAsync,
      isSaving: createMutation.isPending || createCardMutation.isPending || updateMutation.isPending,
      isDeleting: removeMutation.isPending
   }
}