import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
   listCommitments,
   createCommitment,
   createCard,
   updateCommitment,
   deleteCommitment,
   payCardStatement
} from '@/api/endpoints/commitment'

import { useApiError } from '@/hooks/useApiError'
import {
   updateCacheAfterCreateCommitment,
   updateCacheAfterEditCommitment,
   updateCacheAfterDeleteCommitment
} from '@/services/commitmentCacheService'

import { getMonthAndYearFromReference } from '@/utils/formatters'
import type { Commitment } from '@/types/Commitment'

export function useCommitment(month: string, year: string) {
   const queryClient = useQueryClient()
   const { handleError } = useApiError()

   const queryKey = ['commitments', year]

   const { data: allCommitments = [], isLoading, isError } = useQuery({
      queryKey,
      queryFn: () => listCommitments('all', String(year)),
      staleTime: Infinity,
      retry: 1
   })

   const commitments =
      month === 'all'
         ? allCommitments
         : allCommitments.filter(commitment => {
            const { month: refMonth } =
               getMonthAndYearFromReference(commitment.referenceMonth)

            return String(refMonth) === String(month)
         })

   const alertCommitments = allCommitments

   const createMutation = useMutation({
      mutationFn: createCommitment,
      onSuccess: (newCommitments: Commitment[]) => {
         newCommitments.forEach(commitment => {
            const { year: yearCommitment } = getMonthAndYearFromReference(commitment.referenceMonth)

            updateCacheAfterCreateCommitment(
               queryClient,
               commitment,
               yearCommitment
            )
         })
      },

      onError: handleError
   })

   const createCardMutation = useMutation({
      mutationFn: createCard,
      onSuccess: (newCommitments: Commitment[]) => {
         newCommitments.forEach(commitment => {
            const { year: yearCommitment } = getMonthAndYearFromReference(commitment.referenceMonth)

            updateCacheAfterCreateCommitment(
               queryClient,
               commitment,
               yearCommitment
            )
         })
      },
      onError: handleError
   })

   const updateMutation = useMutation({
      mutationFn: updateCommitment,
      onSuccess: (updatedCommitments: Commitment[]) => {
         updatedCommitments.forEach(updatedCommitment => {
            const { year: yearCommitment } = getMonthAndYearFromReference(updatedCommitment.referenceMonth)

            const oldCommitment = queryClient
               .getQueryData<Commitment[]>(['commitments', yearCommitment])
               ?.find(c => c.rowIndex === updatedCommitment.rowIndex)

            if (!oldCommitment) return

            updateCacheAfterEditCommitment(
               queryClient,
               oldCommitment,
               updatedCommitment,
               yearCommitment
            )
         })
      },
      onError: handleError
   })

   const payCardStatementMutation = useMutation({
      mutationFn: payCardStatement,
      onSuccess: (updatedCommitments: Commitment[]) => {
         updatedCommitments.forEach(updatedCommitment => {
            const { year: yearCommitment } = getMonthAndYearFromReference(updatedCommitment.referenceMonth)

            const oldCommitment = queryClient
               .getQueryData<Commitment[]>(['commitments', yearCommitment])
               ?.find(c => c.rowIndex === updatedCommitment.rowIndex)

            if (!oldCommitment) return

            updateCacheAfterEditCommitment(
               queryClient,
               oldCommitment,
               updatedCommitment,
               yearCommitment
            )
         })
      },
      onError: handleError
   })

   const removeMutation = useMutation({
      mutationFn: (
         args: number | { rowIndex: number; scope?: 'single' | 'future' }
      ) => {
         if (typeof args === 'number') {
            return deleteCommitment(args)
         }

         return deleteCommitment(
            args.rowIndex,
            args.scope
         )
      },
      onSuccess: (deletedCommitments: Commitment[]) => {
         if (!deletedCommitments?.length) return

         const byYear = new Map<string, Commitment[]>()
         deletedCommitments.forEach(commitment => {
            const { year: yearCommitment } = getMonthAndYearFromReference(commitment.referenceMonth)
            const list = byYear.get(yearCommitment) ?? []
            list.push(commitment)
            byYear.set(yearCommitment, list)
         })
         byYear.forEach((commitmentsForYear, yearCommitment) => {
            updateCacheAfterDeleteCommitment(
               queryClient,
               commitmentsForYear,
               yearCommitment
            )
         })
      },
      onError: handleError
   })

   return {
      commitments,
      alertCommitments,
      isLoading,
      isError,
      create: createMutation.mutateAsync,
      createCard: createCardMutation.mutateAsync,
      update: updateMutation.mutateAsync,
      payCardStatement: payCardStatementMutation.mutateAsync,
      remove: removeMutation.mutateAsync,
      isSaving:
         createMutation.isPending ||
         createCardMutation.isPending ||
         updateMutation.isPending ||
         payCardStatementMutation.isPending,
      isDeleting: removeMutation.isPending
   }
}