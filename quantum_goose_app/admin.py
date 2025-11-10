from django.contrib import admin
from .models import ConversationSession, Message, Memory, KnowledgeBase, UserPreference, MemorySearchIndex


@admin.register(ConversationSession)
class ConversationSessionAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'user_identifier', 'intelligence_level', 'started_at', 'last_active', 'total_messages', 'is_active']
    list_filter = ['intelligence_level', 'is_active', 'started_at', 'last_active']
    search_fields = ['session_id', 'user_identifier']
    readonly_fields = ['started_at', 'last_active']
    ordering = ['-last_active']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['session', 'role', 'content_preview', 'timestamp', 'token_count', 'intelligence_level']
    list_filter = ['role', 'intelligence_level', 'timestamp']
    search_fields = ['content', 'session__session_id', 'session__user_identifier']
    readonly_fields = ['timestamp']
    ordering = ['-timestamp']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'


@admin.register(Memory)
class MemoryAdmin(admin.ModelAdmin):
    list_display = ['user_identifier', 'memory_type', 'key', 'importance', 'access_count', 'last_accessed', 'is_active', 'created_at']
    list_filter = ['memory_type', 'importance', 'is_active', 'created_at', 'last_accessed']
    search_fields = ['user_identifier', 'key', 'value', 'description']
    readonly_fields = ['created_at', 'updated_at', 'last_accessed']
    ordering = ['-importance', '-updated_at']


@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ['category', 'title', 'relevance_score', 'access_count', 'is_verified', 'created_at']
    list_filter = ['category', 'is_verified', 'created_at', 'updated_at']
    search_fields = ['title', 'content', 'summary', 'source']
    readonly_fields = ['created_at', 'updated_at', 'access_count']
    ordering = ['-relevance_score', '-updated_at']


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user_identifier', 'default_intelligence_level', 'preferred_response_style', 'created_at']
    list_filter = ['default_intelligence_level', 'preferred_response_style', 'created_at', 'updated_at']
    search_fields = ['user_identifier']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['user_identifier']


@admin.register(MemorySearchIndex)
class MemorySearchIndexAdmin(admin.ModelAdmin):
    list_display = ['memory', 'keyword', 'relevance']
    list_filter = ['relevance']
    search_fields = ['keyword', 'memory__key', 'memory__value']
    ordering = ['-relevance']
