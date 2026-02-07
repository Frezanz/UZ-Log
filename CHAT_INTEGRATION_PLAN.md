# Chat Interface Integration Plan

## Executive Summary

This document outlines the comprehensive plan to integrate the chat interface with existing modals, intent detection, and Supabase persistence. The implementation is divided into 4 main phases.

---

## Current State Analysis

### Existing Components
- **ChatInterface.tsx**: Skeleton with UI but no message processing logic
- **IntentDetector.ts**: Pattern-based intent detection (CREATE, DELETE, UPDATE, SHARE, PROTECT, LIST, DUPLICATE, RETRIEVE)
- **Modals**: ContentModal, ShareModal, DeleteModal fully implemented
- **API Layer**: useContent hook with CRUD operations
- **Types**: Chat types, Intent types, Content types properly defined

### What's Missing
- Message processing and intent-to-operation mapping
- Modal integration with chat callbacks
- Session persistence (Supabase integration)
- Intent execution handlers
- Verification workflow
- Cloud AI integration

---

## Phase 1: Modal Integration & Intent Execution

### Goal
Connect chat operations to modals and execute actual operations based on detected intents.

### Tasks

#### 1.1 Create Chat Operation Handlers
**File**: `client/lib/chatOperations.ts`

```typescript
interface ChatOperationContext {
  intent: Intent;
  contentItems: ContentItem[];
  user: User | null;
}

interface ChatOperationResult {
  success: boolean;
  message: string;
  itemId?: string;
  requiresModal?: 'content' | 'share' | 'delete';
  modalProps?: Record<string, any>;
}

export async function executeChatOperation(
  context: ChatOperationContext
): Promise<ChatOperationResult>
```

**Operations to implement**:
- `CREATE`: Open ContentModal with pre-filled data from intent parameters
- `RETRIEVE`: Fetch and display specific content item
- `UPDATE`: Open ContentModal with existing item data
- `DELETE`: Open DeleteModal with confirmation
- `SHARE`: Open ShareModal with pre-configured settings
- `PROTECT`: Execute password protection via API
- `DUPLICATE`: Execute duplication via API
- `LIST`: Return formatted list of matching items
- `SEARCH`: Return filtered content items

#### 1.2 Create Chat Message Processor
**File**: `client/lib/chatMessageProcessor.ts`

```typescript
export async function processChatMessage(
  message: string,
  contentItems: ContentItem[],
  user: User | null
): Promise<ChatMessageType>
```

**Logic**:
1. Detect intent from message
2. Extract parameters (title, type, tags, category, etc.)
3. Validate intent and parameters
4. Return structured response with next action

#### 1.3 Extend ChatInterface Component
**File**: `client/pages/ChatInterface.tsx`

**New state**:
```typescript
const [activeModal, setActiveModal] = useState<'content' | 'share' | 'delete' | null>(null);
const [modalData, setModalData] = useState<any>(null);
const [currentOperation, setCurrentOperation] = useState<Intent | null>(null);
```

**Replace TODO in handleSendMessage**:
```typescript
const intent = detectIntent(input, items);
const result = await executeChatOperation({
  intent,
  contentItems: items,
  user
});

if (result.requiresModal) {
  setActiveModal(result.requiresModal);
  setModalData(result.modalProps);
  setCurrentOperation(intent);
} else {
  // Show success/info message
}
```

**Add modal render**:
```typescript
<ContentModal
  isOpen={activeModal === 'content'}
  onClose={() => setActiveModal(null)}
  onSave={async (data) => {
    // Execute the operation and update chat
  }}
  initialData={modalData}
/>

<DeleteModal
  isOpen={activeModal === 'delete'}
  onClose={() => setActiveModal(null)}
  onConfirm={async () => {
    // Execute delete operation
  }}
  title={modalData?.title}
/>

<ShareModal
  isOpen={activeModal === 'share'}
  onClose={() => setActiveModal(null)}
  item={modalData}
  onTogglePublic={async (item, isPublic) => {
    // Execute share operation
  }}
/>
```

### Deliverables
- [ ] chatOperations.ts with all operation handlers
- [ ] chatMessageProcessor.ts with intent processing
- [ ] ChatInterface.tsx with modal integration
- [ ] Chat tests for operation execution
- [ ] Fix missing SEARCH intent in intentDetector.ts

---

## Phase 2: Session Persistence

### Goal
Store and retrieve chat history from Supabase for authenticated users.

### Tasks

#### 2.1 Update Database Schema
**Required Supabase tables** (if not exist):

```sql
-- chat_sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false
);

-- chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  intent_data JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
```

#### 2.2 Create Chat API Layer
**File**: `client/lib/chatApi.ts`

```typescript
export async function createChatSession(): Promise<ChatSession>
export async function loadChatSession(sessionId: string): Promise<ChatMessage[]>
export async function saveChatMessage(
  sessionId: string,
  message: ChatMessage,
  intent?: Intent
): Promise<void>
export async function listChatSessions(): Promise<ChatSession[]>
export async function deleteChatSession(sessionId: string): Promise<void>
```

**Implementation**:
- Use Supabase client to interact with chat tables
- Handle null cases for guest users (localStorage fallback)
- Add error handling and retry logic

#### 2.3 Persist Messages in ChatInterface
**Update handleSendMessage**:

```typescript
// Save user message to database/localStorage
await saveChatMessage(sessionId, userMessage, intent);

// Save assistant response
await saveChatMessage(sessionId, assistantMessage, intent);
```

**Update loadSession**:
```typescript
if (user && isAuthenticated) {
  // Load from Supabase
  const messages = await loadChatSession(sessionId);
  setMessages(messages);
} else {
  // Load from localStorage or generate new session
}
```

### Deliverables
- [ ] Supabase table migrations
- [ ] chatApi.ts with persistence functions
- [ ] ChatInterface integration with persistence
- [ ] LocalStorage fallback for guest users
- [ ] Chat history UI (list sessions, load session)

---

## Phase 3: Advanced Features

### Goal
Add cloud AI integration, bulk operations, and custom verification.

### Tasks

#### 3.1 Cloud AI Integration (OpenAI/Claude)
**File**: `server/routes/chat-ai.ts` (backend API)

**New API endpoint**: `POST /api/chat/message`

```typescript
interface ChatAIRequest {
  message: string;
  sessionId: string;
  contentContext: ContentItem[];
  localIntent: Intent; // From intentDetector
}

interface ChatAIResponse {
  message: string;
  intent: Intent;
  suggestedActions: {
    type: string;
    label: string;
    params: Record<string, any>;
  }[];
  confidence: number;
}
```

**Implementation**:
1. Combine local intent detection with AI analysis
2. Use AI to clarify ambiguous intents
3. Generate natural language responses
4. Suggest follow-up actions

**Configuration**:
```env
OPENAI_API_KEY=your_key
CLAUDE_API_KEY=your_key
AI_PROVIDER=openai|claude  # fallback to local if not set
```

#### 3.2 Bulk Operations
**File**: `client/lib/bulkOperations.ts`

```typescript
export async function executeBulkOperation(
  operation: IntentType,
  targetItems: ContentItem[],
  parameters: Record<string, any>
): Promise<BulkOperationResult>
```

**Examples**:
- "Delete all videos from 2024"
- "Add 'archived' tag to all text documents"
- "Share all images with john@example.com"
- "Set auto-delete for all temporary notes"

#### 3.3 Custom Verification Workflow
**File**: `client/components/VerificationFlow.tsx`

**Verification methods**:
- Passcode (simple PIN)
- Password (existing account password)
- Security question (custom)
- TOTP (optional 2FA)

**Integration**:
```typescript
if (intent.requiresVerification) {
  const verified = await showVerificationFlow(intent);
  if (verified) {
    // Execute operation
  }
}
```

### Deliverables
- [ ] Backend chat AI endpoint with provider selection
- [ ] Frontend chat AI integration with fallback
- [ ] Bulk operations handler with validation
- [ ] Custom verification UI component
- [ ] Tests for all advanced features

---

## Phase 4: Polish & Testing

### Goal
Ensure all features work together seamlessly with comprehensive testing.

### Tasks

#### 4.1 Integration Testing
- Message processing → Intent detection → Operation execution
- Modal workflows with chat integration
- Session persistence and recovery
- Error handling and edge cases

#### 4.2 User Experience
- Loading states and feedback
- Error messages and recovery suggestions
- Help/documentation in chat
- Keyboard shortcuts and accessibility

#### 4.3 Performance
- Message processing optimization
- Database query optimization
- Lazy loading of content items
- Cache strategy for frequently accessed data

### Deliverables
- [ ] Comprehensive test suite
- [ ] E2E tests for chat workflows
- [ ] Performance benchmarks
- [ ] Documentation and user guide

---

## Implementation Order

1. **Week 1**: Phase 1 - Modal integration & operations
   - chatOperations.ts
   - chatMessageProcessor.ts
   - ChatInterface updates
   - Fix intentDetector SEARCH enum

2. **Week 2**: Phase 2 - Session persistence
   - Database migrations
   - chatApi.ts
   - ChatInterface persistence
   - Session management UI

3. **Week 3**: Phase 3 - Advanced features
   - Cloud AI integration (optional, can defer)
   - Bulk operations
   - Verification workflow

4. **Week 4**: Phase 4 - Testing & polish
   - Comprehensive testing
   - UX refinements
   - Documentation

---

## Code Structure Summary

```
client/
├── lib/
│   ├── chatOperations.ts      [NEW] Phase 1
│   ├── chatMessageProcessor.ts [NEW] Phase 1
│   ├── chatApi.ts             [NEW] Phase 2
│   ├── bulkOperations.ts       [NEW] Phase 3
│   └── intentDetector.ts       [UPDATE] Fix SEARCH
├── pages/
│   └── ChatInterface.tsx       [UPDATE] All phases
├── components/
│   ├── modals/
│   │   ├── ContentModal.tsx    [UPDATE] Phase 1
│   │   ├── ShareModal.tsx      [UPDATE] Phase 1
│   │   └── DeleteModal.tsx     [UPDATE] Phase 1
│   └── VerificationFlow.tsx    [NEW] Phase 3
└── hooks/
    └── useChat.ts              [NEW] Phase 2

server/
├── routes/
│   └── chat-ai.ts             [NEW] Phase 3
└── index.ts                   [UPDATE] Register route

shared/
└── api.ts                      [UPDATE] Add chat endpoints
```

---

## Dependencies

- `openai`: For OpenAI integration
- `@anthropic-ai/sdk`: For Claude integration (optional)
- Existing: Supabase client, React Router, Zustand (if using)

---

## Success Criteria

- [ ] User can type chat message and see intent detected
- [ ] Chat can open modals based on intent
- [ ] Operations execute correctly through chat
- [ ] Chat history persists across sessions
- [ ] Bulk operations work as expected
- [ ] Verification workflow is secure
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Performance within acceptable limits

---

## Known Issues to Address

1. **Missing SEARCH enum**: Add to IntentType in `client/types/chat.ts`
2. **Supabase types**: Generate `shared/database.types.ts` from Supabase schema
3. **Type errors in api.ts**: Fix null safety and Supabase insert type issues
4. **ContentStatus type**: Reconcile "hidden" status with operation type expectations

---

## Questions for Team

1. Should AI integration be required or optional?
2. What AI provider to prioritize? (OpenAI vs Claude)
3. Bulk operation limits (max items per operation)?
4. Verification security level requirements?
5. Chat history retention policy?
