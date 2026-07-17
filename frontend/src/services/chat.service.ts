/**
 * Chat Service
 * Handles all chat-related API calls
 */

import { api } from './api'
import type { ChatRequest, ChatResponse, Conversation, Message } from '@/types'

export const chatService = {
  /**
   * Send a chat message
   */
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/chat/', data)
    return response.data
  },

  /**
   * Get all conversations
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>('/chat/conversations')
    return response.data
  },

  /**
   * Get conversation by ID
   */
  async getConversation(id: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    const response = await api.get(`/chat/conversations/${id}`)
    return response.data
  },

  /**
   * Update conversation title
   */
  async updateConversationTitle(id: string, title: string): Promise<Conversation> {
    const response = await api.patch<Conversation>(`/chat/conversations/${id}/title`, { title })
    return response.data
  },

  /**
   * Delete conversation
   */
  async deleteConversation(id: string): Promise<void> {
    await api.delete(`/chat/conversations/${id}`)
  },
}
