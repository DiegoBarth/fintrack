import { useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
   listCommitments,
   createCommitment,
   createCard,
   updateCommitment,
   deleteCommitment
} from '@/api/endpoints/commitment'
import type { Commitment } from '@/types/Commitment'
import { dateBRToISO } from '@/utils/formatters'

export function useCommitment(month: string, year: string, key?: string | null) {
   const queryClient = useQueryClient()
   const queryKey = ['commitments', key ?? month, year]
   const location = useLocation();

   const enabled = key
      ? ['/commitments', '/'].includes(location.pathname)
      : location.pathname === '/commitments';

   const { data: commitments = [], isLoading, isError } = useQuery({
      queryKey,
      queryFn: () => listCommitments(month, String(year)),
      staleTime: Infinity,
      enabled
   })

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
      onSuccess: (newCommitment: Commitment) => {
         queryClient.setQueryData<Commitment[]>(
            queryKey,
            old => old ? [...old, newCommitment] : [newCommitment]
         )
      }
   })

   const createCardMutation = useMutation({
      mutationFn: (newCommitment: Omit<Commitment, 'rowIndex'>) =>
         createCard(newCommitment),
      onSuccess: (newCommitment: Commitment) => {
         queryClient.setQueryData<Commitment[]>(
            queryKey,
            old => old ? [...old, newCommitment] : [newCommitment]
         )
      }
   })

   const updateMutation = useMutation({
      mutationFn: (data: {
         rowIndex: number
         amount: number
         paymentDate: string
         scope?: 'single'
      }) =>
         updateCommitment(data),
      onSuccess: (_data, variables) => {
         queryClient.setQueryData<Commitment[]>(
            queryKey,
            old =>
               old?.map(r =>
                  r.rowIndex === variables.rowIndex
                     ? {
                        ...r,
                        amount: variables.amount,
                        paymentDate: variables.paymentDate
                     }
                     : r
               ) ?? []
         )

         queryClient.setQueryData<Commitment[]>(
            ['commitments', 'alerts', year],
            old =>
               old?.map(r =>
                  r.rowIndex === variables.rowIndex
                     ? {
                        ...r,
                        amount: variables.amount,
                        paymentDate: dateBRToISO(variables.paymentDate)
                     }
                     : r
               ) ?? []
         )
      }
   })

   const removeMutation = useMutation({
      mutationFn: (rowIndex: number) =>
         deleteCommitment(rowIndex),
      onSuccess: (_data, rowIndex) => {
         queryClient.setQueryData<Commitment[]>(
            queryKey,
            old => old?.filter(r => r.rowIndex !== rowIndex) ?? []
         )

         queryClient.setQueryData<Commitment[]>(
            ['commitments', 'alerts', year],
            old => old?.filter(r => r.rowIndex !== rowIndex) ?? []
         )
      }
   })

   return {
      commitments,
      isLoading,
      isError,
      create: createMutation.mutateAsync,
      createCard: createCardMutation.mutateAsync,
      update: updateMutation.mutateAsync,
      remove: removeMutation.mutateAsync,
      isSaving: updateMutation.isPending,
      isDeleting: removeMutation.isPending
   }
}