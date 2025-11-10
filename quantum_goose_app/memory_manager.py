"""
Memory Manager for HAZoom LLM
Handles storage, retrieval, and management of conversation memory
"""
import uuid
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q, Count
import json

from .models import (
    ConversationSession, Message, Memory, 
    KnowledgeBase, UserPreference, MemorySearchIndex
)


class MemoryManager:
    """
    Manages all memory operations for HAZoom LLM
    """
    
    def __init__(self, user_identifier: str = 'anonymous'):
        self.user_identifier = user_identifier
        self.session = None
    
    # ========================================================================
    # SESSION MANAGEMENT
    # ========================================================================
    
    def create_session(self, session_id: Optional[str] = None) -> ConversationSession:
        """Create a new conversation session"""
        if session_id is None:
            session_id = str(uuid.uuid4())
        
        self.session = ConversationSession.objects.create(
            session_id=session_id,
            user_identifier=self.user_identifier
        )
        return self.session
    
    def get_or_create_session(self, session_id: str) -> ConversationSession:
        """Get existing session or create new one"""
        session, created = ConversationSession.objects.get_or_create(
            session_id=session_id,
            defaults={'user_identifier': self.user_identifier}
        )
        self.session = session
        return session
    
    def get_active_sessions(self, limit: int = 10) -> List[ConversationSession]:
        """Get user's active sessions"""
        return ConversationSession.objects.filter(
            user_identifier=self.user_identifier,
            is_active=True
        )[:limit]
    
    def close_session(self, session_id: str):
        """Close a conversation session"""
        ConversationSession.objects.filter(
            session_id=session_id,
            user_identifier=self.user_identifier
        ).update(is_active=False)
    
    # ========================================================================
    # MESSAGE MANAGEMENT
    # ========================================================================
    
    def add_message(
        self,
        role: str,
        content: str,
        session_id: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Message:
        """Add a message to conversation history"""
        if session_id:
            session = self.get_or_create_session(session_id)
        elif self.session:
            session = self.session
        else:
            session = self.create_session()
        
        message = Message.objects.create(
            session=session,
            role=role,
            content=content,
            metadata=metadata or {}
        )
        
        session.increment_messages()
        return message
    
    def get_conversation_history(
        self,
        session_id: str,
        limit: int = 50,
        role: Optional[str] = None
    ) -> List[Message]:
        """Get conversation history for a session"""
        query = Message.objects.filter(
            session__session_id=session_id,
            session__user_identifier=self.user_identifier
        )
        
        if role:
            query = query.filter(role=role)
        
        return list(query[:limit])
    
    def get_recent_messages(self, limit: int = 10) -> List[Message]:
        """Get recent messages across all sessions"""
        return list(Message.objects.filter(
            session__user_identifier=self.user_identifier
        ).order_by('-timestamp')[:limit])
    
    def clear_conversation_history(self, session_id: str):
        """Clear conversation history for a session"""
        Message.objects.filter(
            session__session_id=session_id,
            session__user_identifier=self.user_identifier
        ).delete()
    
    # ========================================================================
    # MEMORY MANAGEMENT
    # ========================================================================
    
    def store_memory(
        self,
        key: str,
        value: str,
        memory_type: str = 'fact',
        description: str = '',
        importance: int = 5,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict] = None
    ) -> Memory:
        """Store a memory"""
        memory, created = Memory.objects.update_or_create(
            user_identifier=self.user_identifier,
            key=key,
            defaults={
                'value': value,
                'memory_type': memory_type,
                'description': description,
                'importance': importance,
                'tags': tags or [],
                'metadata': metadata or {},
                'is_active': True,
                'updated_at': timezone.now()
            }
        )
        
        # Create search index
        if tags:
            for tag in tags:
                MemorySearchIndex.objects.get_or_create(
                    memory=memory,
                    keyword=tag.lower(),
                    defaults={'relevance': 1.0}
                )
        
        return memory
    
    def get_memory(self, key: str) -> Optional[Memory]:
        """Retrieve a specific memory"""
        try:
            memory = Memory.objects.get(
                user_identifier=self.user_identifier,
                key=key,
                is_active=True
            )
            memory.record_access()
            return memory
        except Memory.DoesNotExist:
            return None
    
    def search_memories(
        self,
        query: str = '',
        memory_type: Optional[str] = None,
        tags: Optional[List[str]] = None,
        limit: int = 10
    ) -> List[Memory]:
        """Search memories by query, type, or tags"""
        queryset = Memory.objects.filter(
            user_identifier=self.user_identifier,
            is_active=True
        )
        
        if memory_type:
            queryset = queryset.filter(memory_type=memory_type)
        
        if query:
            queryset = queryset.filter(
                Q(key__icontains=query) |
                Q(value__icontains=query) |
                Q(description__icontains=query)
            )
        
        if tags:
            for tag in tags:
                queryset = queryset.filter(tags__contains=[tag])
        
        return list(queryset[:limit])
    
    def get_all_memories(
        self,
        memory_type: Optional[str] = None,
        min_importance: int = 0
    ) -> List[Memory]:
        """Get all memories for user"""
        queryset = Memory.objects.filter(
            user_identifier=self.user_identifier,
            is_active=True,
            importance__gte=min_importance
        )
        
        if memory_type:
            queryset = queryset.filter(memory_type=memory_type)
        
        return list(queryset)
    
    def delete_memory(self, key: str):
        """Delete (deactivate) a memory"""
        Memory.objects.filter(
            user_identifier=self.user_identifier,
            key=key
        ).update(is_active=False)
    
    def update_memory_importance(self, key: str, importance: int):
        """Update memory importance"""
        Memory.objects.filter(
            user_identifier=self.user_identifier,
            key=key
        ).update(importance=importance, updated_at=timezone.now())
    
    # ========================================================================
    # KNOWLEDGE BASE
    # ========================================================================
    
    def add_knowledge(
        self,
        category: str,
        title: str,
        content: str,
        summary: str = '',
        keywords: Optional[List[str]] = None,
        source: str = ''
    ) -> KnowledgeBase:
        """Add to global knowledge base"""
        return KnowledgeBase.objects.create(
            category=category,
            title=title,
            content=content,
            summary=summary or content[:200],
            keywords=keywords or [],
            source=source
        )
    
    def search_knowledge(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 5
    ) -> List[KnowledgeBase]:
        """Search knowledge base"""
        queryset = KnowledgeBase.objects.all()
        
        if category:
            queryset = queryset.filter(category=category)
        
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(content__icontains=query) |
                Q(summary__icontains=query) |
                Q(keywords__contains=[query])
            )
        
        results = list(queryset[:limit])
        
        # Record access
        for kb in results:
            kb.record_access()
        
        return results
    
    # ========================================================================
    # USER PREFERENCES
    # ========================================================================
    
    def get_preferences(self) -> UserPreference:
        """Get user preferences"""
        prefs, created = UserPreference.objects.get_or_create(
            user_identifier=self.user_identifier
        )
        return prefs
    
    def update_preferences(self, **kwargs) -> UserPreference:
        """Update user preferences"""
        prefs = self.get_preferences()
        for key, value in kwargs.items():
            if hasattr(prefs, key):
                setattr(prefs, key, value)
        prefs.save()
        return prefs
    
    # ========================================================================
    # CONTEXT BUILDING FOR LLM
    # ========================================================================
    
    def build_llm_context(
        self,
        session_id: str,
        include_memories: bool = True,
        include_knowledge: bool = True,
        include_recent_history: bool = True,
        max_history: int = 10
    ) -> str:
        """
        Build rich context for LLM from memories, knowledge, and history
        """
        context_parts = []
        
        # User preferences
        prefs = self.get_preferences()
        context_parts.append(f"User preference: {prefs.preferred_response_style} responses")
        
        # Important memories
        if include_memories:
            important_memories = self.get_all_memories(min_importance=7)
            if important_memories:
                context_parts.append("\n=== IMPORTANT MEMORIES ===")
                for memory in important_memories[:5]:
                    context_parts.append(f"• {memory.key}: {memory.value}")
        
        # Recent conversation context
        if include_recent_history:
            recent = self.get_conversation_history(session_id, limit=max_history)
            if recent:
                context_parts.append("\n=== RECENT CONVERSATION ===")
                for msg in recent[-5:]:  # Last 5 messages
                    context_parts.append(f"{msg.role}: {msg.content[:100]}...")
        
        # Relevant knowledge
        if include_knowledge:
            # This could be enhanced with semantic search
            context_parts.append("\n=== AVAILABLE KNOWLEDGE ===")
            context_parts.append("Access to system knowledge base for detailed information")
        
        return '\n'.join(context_parts)
    
    # ========================================================================
    # ANALYTICS & INSIGHTS
    # ========================================================================
    
    def get_memory_stats(self) -> Dict:
        """Get memory statistics"""
        memories = Memory.objects.filter(
            user_identifier=self.user_identifier,
            is_active=True
        )
        
        return {
            'total_memories': memories.count(),
            'by_type': {
                mt: memories.filter(memory_type=mt).count()
                for mt, _ in Memory.MEMORY_TYPES
            },
            'total_sessions': ConversationSession.objects.filter(
                user_identifier=self.user_identifier
            ).count(),
            'total_messages': Message.objects.filter(
                session__user_identifier=self.user_identifier
            ).count(),
            'most_accessed': list(
                memories.order_by('-access_count')[:5].values(
                    'key', 'value', 'access_count'
                )
            )
        }
    
    def cleanup_old_sessions(self, days: int = 30):
        """Clean up old inactive sessions"""
        cutoff = timezone.now() - timedelta(days=days)
        ConversationSession.objects.filter(
            user_identifier=self.user_identifier,
            last_active__lt=cutoff,
            is_active=False
        ).delete()
