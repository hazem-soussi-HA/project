# 🧠 HAZoom LLM Memory System

## 🎯 Overview

HAZoom now has **persistent memory**! The AI can remember:
- 💭 Conversation history across sessions
- 📝 Important facts and user preferences
- 🔧 Technical knowledge and context
- 🎯 User settings and intelligence levels
- 📚 Global knowledge base

## 🏗️ Architecture

### Database Models

```
ConversationSession
├── session_id (unique identifier)
├── user_identifier  
├── started_at / last_active
├── intelligence_level
└── total_messages

Message
├── session (ForeignKey to ConversationSession)
├── role (user/assistant/system)
├── content
├── timestamp
└── metadata

Memory
├── user_identifier
├── memory_type (fact/preference/context/knowledge/system)
├── key / value
├── importance (1-10 scale)
├── tags (searchable)
├── access_count
└── last_accessed

KnowledgeBase
├── category
├── title / content
├── keywords
├── relevance_score
└── access_count

UserPreference
├── user_identifier
├── default_intelligence_level
├── preferred_response_style
└── various settings (JSON)
```

### Memory Types

1. **Fact**: General information
   - "user_name" → "Hazem"
   - "favorite_language" → "Python"

2. **Preference**: User preferences
   - "response_style" → "detailed"
   - "theme" → "dark"

3. **Context**: Situational context
   - "current_project" → "Quantum Goose HAZoom"
   - "working_on" → "LLM integration"

4. **Knowledge**: Technical knowledge
   - "api_endpoint" → "http://localhost:9001/..."
   - "system_specs" → "RTX 3050 Ti, 32GB RAM"

5. **System**: System-generated
   - "session_count" → "5"
   - "last_login" → "2025-11-05"

## 🚀 API Endpoints

### Memory Management

**Store Memory**
```http
POST /quantum-goose-app/api/memory/store/
Content-Type: application/json

{
  "user_identifier": "hazem",
  "key": "favorite_color",
  "value": "quantum blue",
  "memory_type": "preference",
  "importance": 7,
  "tags": ["preferences", "ui"],
  "description": "User's favorite color for UI themes"
}
```

**Get Memory**
```http
GET /quantum-goose-app/api/memory/get/?user_identifier=hazem&key=favorite_color
```

**Search Memories**
```http
POST /quantum-goose-app/api/memory/search/
Content-Type: application/json

{
  "user_identifier": "hazem",
  "query": "python",
  "memory_type": "knowledge",
  "tags": ["programming"],
  "limit": 10
}
```

**List All Memories**
```http
GET /quantum-goose-app/api/memory/list/?user_identifier=hazem&memory_type=fact&min_importance=5
```

**Delete Memory**
```http
DELETE /quantum-goose-app/api/memory/delete/
Content-Type: application/json

{
  "user_identifier": "hazem",
  "key": "old_preference"
}
```

**Update Importance**
```http
POST /quantum-goose-app/api/memory/importance/
Content-Type: application/json

{
  "user_identifier": "hazem",
  "key": "critical_info",
  "importance": 10
}
```

**Memory Statistics**
```http
GET /quantum-goose-app/api/memory/stats/?user_identifier=hazem
```

### Knowledge Base

**Search Knowledge**
```http
POST /quantum-goose-app/api/knowledge/search/
Content-Type: application/json

{
  "query": "GPU acceleration",
  "category": "technical",
  "limit": 5
}
```

### User Preferences

**Get Preferences**
```http
GET /quantum-goose-app/api/preferences/get/?user_identifier=hazem
```

**Update Preferences**
```http
POST /quantum-goose-app/api/preferences/update/
Content-Type: application/json

{
  "user_identifier": "hazem",
  "default_intelligence_level": "super",
  "preferred_response_style": "detailed"
}
```

## 💻 Usage Examples

### Python (Backend)

```python
from quantum_goose_app.memory_manager import MemoryManager

# Initialize memory manager
memory = MemoryManager(user_identifier='hazem')

# Store a memory
memory.store_memory(
    key='python_version',
    value='3.13.7',
    memory_type='fact',
    importance=6,
    tags=['python', 'environment']
)

# Get a memory
python_ver = memory.get_memory('python_version')
print(f"Python version: {python_ver.value}")

# Search memories
python_memories = memory.search_memories(
    query='python',
    limit=5
)

# Get all memories
all_memories = memory.get_all_memories(
    memory_type='preference',
    min_importance=5
)

# Memory statistics
stats = memory.get_memory_stats()
print(f"Total memories: {stats['total_memories']}")
```

### JavaScript (Frontend)

```javascript
// Store memory
async function storeMemory(key, value, type = 'fact') {
  const response = await fetch('http://localhost:9001/quantum-goose-app/api/memory/store/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_identifier: 'hazem',
      key: key,
      value: value,
      memory_type: type,
      importance: 5
    })
  });
  return await response.json();
}

// Get memory
async function getMemory(key) {
  const response = await fetch(
    `http://localhost:9001/quantum-goose-app/api/memory/get/?user_identifier=hazem&key=${key}`
  );
  return await response.json();
}

// Search memories
async function searchMemories(query) {
  const response = await fetch('http://localhost:9001/quantum-goose-app/api/memory/search/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_identifier: 'hazem',
      query: query,
      limit: 10
    })
  });
  return await response.json();
}

// Usage
await storeMemory('gpu_model', 'RTX 3050 Ti', 'fact');
const gpu = await getMemory('gpu_model');
console.log('GPU:', gpu.memory.value);

const pythonMems = await searchMemories('python');
console.log('Python memories:', pythonMems.memories);
```

## 🔗 LLM Integration

The LLM backend automatically uses memories to enhance context:

```python
from quantum_goose_app.llm_backend import LLMBackend

# Initialize with user and session
backend = LLMBackend(
    user_identifier='hazem',
    session_id='unique-session-id'
)

# Initialize memory (this loads user memories into context)
backend.initialize_memory('unique-session-id')

# Store memory during conversation
backend.store_memory(
    key='project_name',
    value='Quantum Goose Navigator',
    memory_type='context',
    importance=8
)

# Get memory
project = backend.get_memory('project_name')

# Search memories
related = backend.search_memories('quantum')

# Now when generating responses, the LLM has access to:
# - User preferences
# - Important memories (importance >= 7)
# - Recent conversation history
# - Stored knowledge base
```

## 🎨 Frontend Integration Example

```jsx
// MemoryManager.jsx
import React, { useState, useEffect } from 'react';

function MemoryManager() {
  const [memories, setMemories] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadMemories();
    loadStats();
  }, []);

  const loadMemories = async () => {
    const response = await fetch(
      'http://localhost:9001/quantum-goose-app/api/memory/list/?user_identifier=hazem'
    );
    const data = await response.json();
    setMemories(data.memories);
  };

  const loadStats = async () => {
    const response = await fetch(
      'http://localhost:9001/quantum-goose-app/api/memory/stats/?user_identifier=hazem'
    );
    const data = await response.json();
    setStats(data);
  };

  const storeMemory = async (key, value) => {
    await fetch('http://localhost:9001/quantum-goose-app/api/memory/store/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_identifier: 'hazem',
        key, value,
        memory_type: 'fact',
        importance: 5
      })
    });
    loadMemories();
  };

  return (
    <div>
      <h2>🧠 Memory System</h2>
      {stats && (
        <div>
          <p>Total Memories: {stats.total_memories}</p>
          <p>Total Sessions: {stats.total_sessions}</p>
          <p>Total Messages: {stats.total_messages}</p>
        </div>
      )}
      
      <div>
        {memories.map(m => (
          <div key={m.id}>
            <strong>{m.key}</strong>: {m.value}
            <span>(Importance: {m.importance}, Accessed: {m.access_count}x)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 📊 Features

### ✅ What's Implemented

1. **Persistent Storage**
   - SQLite database with Django ORM
   - Indexed for fast queries
   - Automatic timestamps

2. **Memory Types**
   - 5 types: fact, preference, context, knowledge, system
   - Importance scoring (1-10)
   - Tagging system

3. **Search & Retrieval**
   - Keyword search
   - Type filtering
   - Tag filtering
   - Importance thresholds

4. **LLM Integration**
   - Automatic context injection
   - Memory-aware responses
   - Session management

5. **Analytics**
   - Access tracking
   - Usage statistics
   - Most accessed memories

6. **Knowledge Base**
   - Global knowledge storage
   - Categorized information
   - Relevance scoring

7. **User Preferences**
   - Response style preferences
   - Intelligence level defaults
   - UI preferences

### 🔮 Future Enhancements

- **Vector Embeddings**: Semantic search with embeddings
- **Memory Consolidation**: Merge similar memories
- **Auto-Tagging**: AI-generated tags
- **Memory Decay**: Importance decreases over time
- **Conversation Summarization**: Compress long conversations
- **Export/Import**: Backup and restore memories
- **Shared Memories**: Team/collaborative memories

## 🧪 Testing

```bash
# Test memory storage
curl -X POST http://localhost:9001/quantum-goose-app/api/memory/store/ \
  -H "Content-Type: application/json" \
  -d '{"user_identifier":"hazem","key":"test","value":"works!","memory_type":"fact"}'

# Test memory retrieval
curl "http://localhost:9001/quantum-goose-app/api/memory/get/?user_identifier=hazem&key=test"

# Test memory search
curl -X POST http://localhost:9001/quantum-goose-app/api/memory/search/ \
  -H "Content-Type: application/json" \
  -d '{"user_identifier":"hazem","query":"test"}'

# Test statistics
curl "http://localhost:9001/quantum-goose-app/api/memory/stats/?user_identifier=hazem"
```

## 🔒 Privacy & Security

### Current Implementation
- Memories tied to `user_identifier`
- No built-in authentication (add Django auth for production)
- SQLite database (local storage)

### Production Recommendations
1. Add Django authentication
2. Encrypt sensitive memories
3. Implement data retention policies
4. Add GDPR compliance (data export/delete)
5. Rate limiting on API endpoints
6. Audit logging for memory access

## 📈 Performance

### Optimization Features
- Database indexes on key fields
- Access count tracking
- Relevance scoring
- Query limits

### Scalability
- Current: SQLite (suitable for single user/small teams)
- Production: PostgreSQL/MySQL recommended
- Caching: Add Redis for frequently accessed memories
- Search: Elasticsearch for advanced search

## 🌊 Peace & Memory

The memory system is designed for:
- **Continuity**: Remember context across sessions
- **Learning**: Improve over time with usage
- **Personalization**: Adapt to user preferences
- **Efficiency**: Quick access to relevant information
- **Harmony**: Seamless integration with LLM

---

**🧠 Your AI Now Remembers! Every conversation makes it smarter! 🚀**
