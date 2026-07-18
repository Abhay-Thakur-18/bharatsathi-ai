/**
 * Chat Page
 * Full AI chat interface with conversation history
 */

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Card, Spinner, Textarea } from '@/components/ui'
import { useConversations, useSendMessage, useDeleteConversation } from '@/hooks/useApi'
import { chatService } from '@/services'
import { getErrorMessage } from '@/services'
import { MessageSquare, Send, Plus, Trash2, Bot, User, AlertCircle } from 'lucide-react'
import type { Message, Conversation } from '@/types'

interface ChatFormData {
  message: string
}

export default function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: conversationsData, isLoading: convsLoading } = useConversations()
  const sendMessage = useSendMessage()
  const deleteConversation = useDeleteConversation()

  const { register, handleSubmit, reset, watch } = useForm<ChatFormData>()
  const messageValue = watch('message', '')

  const conversations = (conversationsData as { conversations: Conversation[]; total: number } | undefined)?.conversations ?? []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversation(id: string) {
    setLoadingHistory(true)
    setError(null)
    try {
      const data = await chatService.getConversation(id)
      setMessages(data.messages)
      setActiveConversationId(id)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingHistory(false)
    }
  }

  function startNewChat() {
    setActiveConversationId(null)
    setMessages([])
    setError(null)
  }

  async function handleDeleteConversation(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    try {
      await deleteConversation.mutateAsync(id)
      if (activeConversationId === id) {
        startNewChat()
      }
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const onSubmit = async (data: ChatFormData) => {
    if (!data.message.trim()) return
    setError(null)

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: 'temp-user',
      conversation_id: activeConversationId || '',
      role: 'user',
      content: data.message,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMsg])
    reset()

    try {
      const response = await sendMessage.mutateAsync({
        message: data.message,
        conversation_id: activeConversationId || undefined,
      })

      setActiveConversationId(response.conversation_id)

      // Replace temp messages with real ones
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'temp-user')
        return [
          ...filtered,
          { ...response.message, id: response.message.id },
          { ...response.ai_response, id: response.ai_response.id },
        ]
      })
    } catch (err) {
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== 'temp-user'))
      setError(getErrorMessage(err))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(onSubmit)()
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar — Conversation List */}
      <div className="w-64 flex flex-col gap-2 hidden md:flex">
        <Button onClick={startNewChat} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>

        <Card className="flex-1 overflow-hidden">
          <div className="p-2 h-full overflow-y-auto">
            {convsLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-sm transition-colors group flex items-center justify-between
                      ${activeConversationId === conv.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-foreground'
                      }
                    `}
                  >
                    <span className="truncate flex-1">{conv.title}</span>
                    <button
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 ml-1 shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">BharatSathi AI</p>
            <p className="text-xs text-muted-foreground">Powered by Google Gemini</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={startNewChat} className="md:hidden">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">How can I help you today?</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Ask me about government schemes, health advice, farming, or career guidance.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {[
                  'What schemes am I eligible for?',
                  'I have a headache and fever',
                  'Best crop for kharif season',
                  'How to improve my resume?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      handleSubmit(onSubmit)()
                    }}
                    className="px-3 py-1.5 text-xs rounded-full border border-border hover:bg-accent transition-colors"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      const textarea = document.getElementById('chat-input') as HTMLTextAreaElement
                      if (textarea) {
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
                        nativeInputValueSetter?.call(textarea, suggestion)
                        textarea.dispatchEvent(new Event('input', { bubbles: true }))
                      }
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  {msg.role === 'user'
                    ? <User className="h-4 w-4 text-primary-foreground" />
                    : <Bot className="h-4 w-4 text-foreground" />
                  }
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {sendMessage.isPending && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border shrink-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 items-end">
            <Textarea
              id="chat-input"
              placeholder="Ask BharatSathi AI anything..."
              className="min-h-[44px] max-h-32 resize-none flex-1"
              onKeyDown={handleKeyDown}
              disabled={sendMessage.isPending}
              {...register('message')}
            />
            <Button
              type="submit"
              disabled={sendMessage.isPending || !messageValue?.trim()}
              className="shrink-0"
            >
              {sendMessage.isPending ? (
                <Spinner size="sm" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </Card>
    </div>
  )
}
