/**
 * Chat Service
 * Handles all chat-related API calls
 */

import { api } from './api'
import type { ChatRequest, ChatResponse, Conversation, Message } from '@/types'

interface BackendChatResponse {
  conversation_id: string
  user_message: Message
  assistant_message: Message
}

interface ConversationListResponse {
  conversations: Conversation[]
  total: number
}

export const chatService = {
  /**
   * Send a chat message
   */
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    const response = await api.post<BackendChatResponse>('/chat/', data)
    // Map backend field names to frontend types
    return {
      conversation_id: response.data.conversation_id,
      message: response.data.user_message,
      ai_response: response.data.assistant_message,
    }
  },

  /**
   * Get all conversations
   */
  async getConversations(): Promise<ConversationListResponse> {
    const response = await api.get<ConversationListResponse>('/chat/conversations')
    return response.data
  },

  /**
   * Get conversation by ID with messages
   */
  async getConversation(id: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    const response = await api.get(`/chat/conversations/${id}`)
    return response.data
  },

  /**
   * Update conversation title
   */
  async updateConversationTitle(id: string, title: string): Promise<void> {
    await api.patch(`/chat/conversations/${id}/title`, { title })
  },

  /**
   * Delete conversation
   */
  async deleteConversation(id: string): Promise<void> {
    await api.delete(`/chat/conversations/${id}`)
  },
}
