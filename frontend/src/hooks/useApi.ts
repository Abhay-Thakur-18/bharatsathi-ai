/**
 * Custom API hooks using TanStack Query
 * Provides type-safe, cached API calls with loading and error states
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService, schemeService, profileService } from '@/services'
import type {
  ChatRequest,
  SchemeSearchParams,
  SchemeRecommendRequest,
  ProfileUpdateRequest,
  PreferencesUpdateRequest,
} from '@/types'

// Query Keys
export const queryKeys = {
  conversations: ['conversations'] as const,
  conversation: (id: string) => ['conversation', id] as const,
  schemes: (params: SchemeSearchParams) => ['schemes', params] as const,
  scheme: (id: string) => ['scheme', id] as const,
  categories: ['categories'] as const,
  profile: ['profile'] as const,
  profileStats: ['profile', 'statistics'] as const,
  profileActivity: ['profile', 'activity'] as const,
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

/**
 * Profile Hooks
 */

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => profileService.getProfile(),
    staleTime: 2 * 60 * 1000, // 2 min
  })
}

export function useProfileStats() {
  return useQuery({
    queryKey: queryKeys.profileStats,
    queryFn: () => profileService.getStatistics(),
    staleTime: 60 * 1000, // 1 min
  })
}

export function useProfileActivity() {
  return useQuery({
    queryKey: queryKeys.profileActivity,
    queryFn: () => profileService.getActivity(),
    staleTime: 60 * 1000,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProfileUpdateRequest) => profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PreferencesUpdateRequest) => profileService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ current_password, new_password }: { current_password: string; new_password: string }) =>
      profileService.changePassword(current_password, new_password),
  })
}

export function useLogoutAll() {
  return useMutation({
    mutationFn: () => profileService.logoutAll(),
  })
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => profileService.deleteAccount(),
  })
}


