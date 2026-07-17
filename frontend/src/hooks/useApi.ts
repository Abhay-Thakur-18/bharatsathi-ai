/**
 * Custom API hooks using TanStack Query
 * Provides type-safe, cached API calls with loading and error states
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService, schemeService } from '@/services'
import type {
  ChatRequest,
  SchemeSearchParams,
  SchemeRecommendRequest,
} from '@/types'

// Query Keys
export const queryKeys = {
  conversations: ['conversations'] as const,
  conversation: (id: string) => ['conversation', id] as const,
  schemes: (params: SchemeSearchParams) => ['schemes', params] as const,
  scheme: (id: string) => ['scheme', id] as const,
  categories: ['categories'] as const,
}

/**
 * Chat Hooks
 */

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => chatService.getConversations(),
  })
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: queryKeys.conversation(id),
    queryFn: () => chatService.getConversation(id),
    enabled: !!id,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ChatRequest) => chatService.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations })
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => chatService.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations })
    },
  })
}

/**
 * Scheme Hooks
 */

export function useSchemes(params: SchemeSearchParams = {}) {
  return useQuery({
    queryKey: queryKeys.schemes(params),
    queryFn: () => schemeService.searchSchemes(params),
  })
}

export function useScheme(id: string) {
  return useQuery({
    queryKey: queryKeys.scheme(id),
    queryFn: () => schemeService.getScheme(id),
    enabled: !!id,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => schemeService.getCategories(),
  })
}

export function useSchemeRecommendations() {
  return useMutation({
    mutationFn: (data: SchemeRecommendRequest) =>
      schemeService.getRecommendations(data),
  })
}

export function useSchemeExplanation() {
  return useMutation({
    mutationFn: (id: string) => schemeService.getExplanation(id),
  })
}
