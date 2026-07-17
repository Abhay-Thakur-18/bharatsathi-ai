# API Integration Guide

## Overview

The frontend is fully configured to communicate with the BharatSathi AI backend API.

## Configuration

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000
```

The API base URL is configurable via `.env` file.

## API Client

### Axios Instance (`src/services/api.ts`)

- **Base URL**: Configured from environment variable
- **Request Interceptor**: Automatically adds JWT token to all requests
- **Response Interceptor**: Handles 401 (logout), 403, and 500 errors globally

```typescript
import { api } from '@/services'

// All requests automatically include Authorization header
const response = await api.get('/endpoint')
```

## Services

### Authentication Service (`auth.service.ts`)

```typescript
import { authService } from '@/services'

// Register
await authService.register({ email, password, full_name })

// Login
await authService.login({ email, password })

// Get current user
await authService.getCurrentUser()

// Logout
authService.logout()
```

### Chat Service (`chat.service.ts`)

```typescript
import { chatService } from '@/services'

// Send message
await chatService.sendMessage({ message, conversation_id })

// Get conversations
await chatService.getConversations()

// Get conversation
await chatService.getConversation(id)

// Update title
await chatService.updateConversationTitle(id, title)

// Delete conversation
await chatService.deleteConversation(id)
```

### Scheme Service (`scheme.service.ts`)

```typescript
import { schemeService } from '@/services'

// Search schemes
await schemeService.searchSchemes({ search, category, state })

// Get scheme
await schemeService.getScheme(id)

// Get categories
await schemeService.getCategories()

// Get recommendations
await schemeService.getRecommendations(userData)

// Get explanation
await schemeService.getExplanation(id)
```

## Authentication Context

### Usage

```typescript
import { useAuth } from '@/contexts/AuthContext'

function Component() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Please login</div>
  }
  
  return <div>Welcome {user.full_name}</div>
}
```

### Available Methods

- `user`: Current user object or null
- `isLoading`: Loading state
- `isAuthenticated`: Boolean authentication status
- `login(data)`: Login user
- `register(data)`: Register user
- `logout()`: Logout user
- `refreshUser()`: Refresh user data

## React Query Hooks

### Chat Hooks

```typescript
import { useConversations, useSendMessage } from '@/hooks/useApi'

function ChatComponent() {
  const { data: conversations, isLoading } = useConversations()
  const sendMessage = useSendMessage()
  
  const handleSend = async (message: string) => {
    await sendMessage.mutateAsync({ message })
  }
}
```

### Scheme Hooks

```typescript
import { useSchemes, useScheme } from '@/hooks/useApi'

function SchemesComponent() {
  const { data: schemes } = useSchemes({ search: 'education' })
  const { data: scheme } = useScheme(id)
}
```

## Error Handling

```typescript
import { getErrorMessage } from '@/services'

try {
  await api.post('/endpoint', data)
} catch (error) {
  const message = getErrorMessage(error)
  console.error(message)
}
```

## Authentication Flow

1. User submits login form
2. `authService.login()` sends request to `/auth/login`
3. Backend returns `access_token` and `user` object
4. Token saved to `localStorage`
5. User saved to `localStorage` and state
6. User redirected to `/dashboard`
7. All subsequent API requests include `Authorization: Bearer <token>` header
8. On 401 error, user is logged out and redirected to `/login`

## Protected Routes

Routes automatically check authentication status using `useAuth()`:

```typescript
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

- Shows loading spinner while checking auth
- Redirects to `/login` if not authenticated
- Renders page if authenticated

## Backend Endpoints

### Authentication
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Chat
- `POST /chat/`
- `GET /chat/conversations`
- `GET /chat/conversations/:id`
- `PATCH /chat/conversations/:id/title`
- `DELETE /chat/conversations/:id`

### Schemes
- `GET /schemes/`
- `GET /schemes/categories`
- `GET /schemes/:id`
- `POST /schemes/recommend`
- `POST /schemes/explain/:id`

### Healthcare
- `POST /healthcare/symptom-check`
- `POST /healthcare/ask`
- `GET /healthcare/government-health-schemes`
- `GET /healthcare/emergency-numbers`

### Agriculture
- `POST /agriculture/crop-advice`
- `POST /agriculture/pest-disease`
- `POST /agriculture/fertilizer`
- `GET /agriculture/government-schemes`
- `GET /agriculture/helplines`

### Career
- `POST /career/advice`
- `POST /career/resume-review`
- `POST /career/skill-assessment`
- `POST /career/interview-prep`
- `GET /career/government-programs`

## Testing

Start backend server:
```bash
cd backend
uvicorn app.main:app --reload
```

Start frontend dev server:
```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:3000`
Backend will be available at `http://localhost:8000`

## Next Steps

1. Implement authentication pages with forms
2. Build chat interface with real API calls
3. Create scheme browser with search and filters
4. Add remaining module pages
5. Test full integration with backend

## Status

✅ API client configured
✅ Services created
✅ Authentication context implemented
✅ React Query hooks ready
✅ Error handling in place
✅ Protected routes working
✅ Token management automated

**Ready for feature implementation!**
