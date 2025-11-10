"""
Database models for HAZoom LLM Memory System
Stores conversation history, user preferences, and knowledge base
"""
from django.db import models
from django.utils import timezone
import json


class ConversationSession(models.Model):
    """Represents a conversation session with HAZoom"""
    session_id = models.CharField(max_length=100, unique=True, db_index=True)
    user_identifier = models.CharField(max_length=255, default='anonymous', db_index=True)
    started_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
    intelligence_level = models.CharField(
        max_length=20,
        default='super',
        choices=[
            ('nano', 'Nano'),
            ('standard', 'Standard'),
            ('super', 'Super'),
            ('quantum', 'Quantum')
        ]
    )
    total_messages = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-last_active']
        indexes = [
            models.Index(fields=['session_id', 'user_identifier']),
            models.Index(fields=['last_active']),
        ]
    
    def __str__(self):
        return f"Session {self.session_id} - {self.user_identifier}"
    
    def increment_messages(self):
        """Increment message count"""
        self.total_messages += 1
        self.last_active = timezone.now()
        self.save(update_fields=['total_messages', 'last_active'])


class Message(models.Model):
    """Stores individual messages in conversations"""
    session = models.ForeignKey(
        ConversationSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    role = models.CharField(
        max_length=20,
        choices=[
            ('user', 'User'),
            ('assistant', 'Assistant'),
            ('system', 'System')
        ]
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    token_count = models.IntegerField(default=0)
    intelligence_level = models.CharField(max_length=20, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['session', 'timestamp']),
            models.Index(fields=['role', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."


class Memory(models.Model):
    """
    Stores persistent memories for HAZoom
    Can be facts, preferences, or important information
    """
    MEMORY_TYPES = [
        ('fact', 'Fact'),
        ('preference', 'Preference'),
        ('context', 'Context'),
        ('knowledge', 'Knowledge'),
        ('system', 'System'),
    ]
    
    user_identifier = models.CharField(max_length=255, db_index=True)
    memory_type = models.CharField(max_length=20, choices=MEMORY_TYPES, default='fact')
    key = models.CharField(max_length=255, db_index=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    access_count = models.IntegerField(default=0)
    last_accessed = models.DateTimeField(null=True, blank=True)
    importance = models.IntegerField(
        default=5,
        help_text="1-10 scale, higher = more important"
    )
    tags = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-importance', '-updated_at']
        unique_together = ['user_identifier', 'key']
        indexes = [
            models.Index(fields=['user_identifier', 'memory_type']),
            models.Index(fields=['key']),
            models.Index(fields=['importance', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.memory_type}: {self.key} = {self.value[:50]}..."
    
    def record_access(self):
        """Record that this memory was accessed"""
        self.access_count += 1
        self.last_accessed = timezone.now()
        self.save(update_fields=['access_count', 'last_accessed'])


class KnowledgeBase(models.Model):
    """
    Global knowledge base for HAZoom
    Stores general information that applies to all users
    """
    CATEGORY_CHOICES = [
        ('system', 'System Information'),
        ('api', 'API Documentation'),
        ('tutorial', 'Tutorial/Guide'),
        ('faq', 'FAQ'),
        ('technical', 'Technical Knowledge'),
        ('quantum', 'Quantum Concepts'),
        ('general', 'General Knowledge'),
    ]
    
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, db_index=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    summary = models.TextField(blank=True)
    keywords = models.JSONField(default=list, blank=True)
    source = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    access_count = models.IntegerField(default=0)
    relevance_score = models.FloatField(default=1.0)
    is_verified = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-relevance_score', '-updated_at']
        indexes = [
            models.Index(fields=['category', 'relevance_score']),
            models.Index(fields=['title']),
        ]
    
    def __str__(self):
        return f"{self.category}: {self.title}"
    
    def record_access(self):
        """Record access and boost relevance"""
        self.access_count += 1
        self.relevance_score = min(10.0, self.relevance_score * 1.01)
        self.save(update_fields=['access_count', 'relevance_score'])


class UserPreference(models.Model):
    """
    Stores user preferences and settings
    """
    user_identifier = models.CharField(max_length=255, unique=True, db_index=True)
    default_intelligence_level = models.CharField(max_length=20, default='super')
    preferred_response_style = models.CharField(
        max_length=50,
        default='detailed',
        choices=[
            ('concise', 'Concise'),
            ('detailed', 'Detailed'),
            ('technical', 'Technical'),
            ('casual', 'Casual'),
            ('quantum', 'Quantum Consciousness'),
        ]
    )
    system_info_preferences = models.JSONField(default=dict, blank=True)
    notification_settings = models.JSONField(default=dict, blank=True)
    ui_preferences = models.JSONField(default=dict, blank=True)
    privacy_settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['user_identifier']
    
    def __str__(self):
        return f"Preferences for {self.user_identifier}"


class MemorySearchIndex(models.Model):
    """
    Search index for fast memory retrieval
    Uses simple keyword matching (can be upgraded to vector embeddings)
    """
    memory = models.ForeignKey(Memory, on_delete=models.CASCADE, related_name='search_index')
    keyword = models.CharField(max_length=100, db_index=True)
    relevance = models.FloatField(default=1.0)
    
    class Meta:
        indexes = [
            models.Index(fields=['keyword', 'relevance']),
        ]
    
    def __str__(self):
        return f"Index: {self.keyword} -> Memory #{self.memory.id}"
