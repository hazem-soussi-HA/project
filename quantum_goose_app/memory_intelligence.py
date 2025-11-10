"""
Memory Intelligence Module
Extracts and manages memories from conversations automatically
"""
import re
from typing import List, Dict, Optional, Tuple
from datetime import datetime


class MemoryIntelligence:
    """
    Intelligent memory extraction and management
    """
    
    # Patterns for extracting different types of information
    PATTERNS = {
        'name': [
            r"(?:my name is|i'm|i am|call me|i go by) ([A-Z][a-z]+)",
            r"(?:this is|it's) ([A-Z][a-z]+) (?:speaking|here)",
        ],
        'preference': [
            r"i (?:like|love|prefer|enjoy) ([^.,!?]+)",
            r"my favorite ([^.,!?]+) is ([^.,!?]+)",
            r"i (?:hate|dislike|don't like) ([^.,!?]+)",
        ],
        'fact': [
            r"i (?:have|own|use|work with) ([^.,!?]+)",
            r"my ([a-z]+) is ([^.,!?]+)",
            r"i (?:am|was) (?:a |an )?([^.,!?]+)",
        ],
        'remember': [
            r"remember (?:that |this: ?)?([^.,!?]+)",
            r"don't forget (?:that |this: ?)?([^.,!?]+)",
            r"keep in mind (?:that |this: ?)?([^.,!?]+)",
            r"note (?:that |this: ?)?([^.,!?]+)",
        ],
        'system': [
            r"i(?:'m| am) (?:using|running|on) ([^.,!?]+)",
            r"my system (?:has|is) ([^.,!?]+)",
            r"i have a ([A-Z][^.,!?]+) (?:GPU|CPU|graphics card)",
        ]
    }
    
    @classmethod
    def extract_memories_from_text(cls, text: str, user_id: str) -> List[Dict]:
        """
        Extract potential memories from user text
        Returns list of memory dictionaries
        """
        memories = []
        text_lower = text.lower()
        
        # Extract name
        for pattern in cls.PATTERNS['name']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                memories.append({
                    'key': 'user_name',
                    'value': match.group(1),
                    'memory_type': 'preference',
                    'importance': 9,
                    'tags': ['personal', 'identity'],
                    'description': f'User identified themselves as {match.group(1)}'
                })
                break
        
        # Extract preferences
        for pattern in cls.PATTERNS['preference']:
            matches = re.finditer(pattern, text_lower)
            for match in matches:
                if len(match.groups()) >= 2:
                    key = f"favorite_{match.group(1).replace(' ', '_')}"
                    value = match.group(2)
                else:
                    value = match.group(1).strip()
                    key = f"preference_{cls._generate_key(value)}"
                
                memories.append({
                    'key': key,
                    'value': value,
                    'memory_type': 'preference',
                    'importance': 7,
                    'tags': ['preference', 'likes'],
                    'description': f'User preference: {value}'
                })
        
        # Extract explicit "remember" requests
        for pattern in cls.PATTERNS['remember']:
            matches = re.finditer(pattern, text_lower)
            for match in matches:
                content = match.group(1).strip()
                memories.append({
                    'key': f"important_{cls._generate_key(content)}",
                    'value': content,
                    'memory_type': 'fact',
                    'importance': 10,
                    'tags': ['important', 'explicit'],
                    'description': 'User explicitly requested to remember this'
                })
        
        # Extract system information
        for pattern in cls.PATTERNS['system']:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                content = match.group(1).strip()
                memories.append({
                    'key': f"system_{cls._generate_key(content)}",
                    'value': content,
                    'memory_type': 'system',
                    'importance': 6,
                    'tags': ['system', 'technical'],
                    'description': f'System information: {content}'
                })
        
        # Extract general facts
        for pattern in cls.PATTERNS['fact']:
            matches = re.finditer(pattern, text_lower)
            for match in matches:
                if len(match.groups()) >= 2:
                    key = match.group(1).replace(' ', '_')
                    value = match.group(2)
                else:
                    value = match.group(1).strip()
                    key = cls._generate_key(value)
                
                # Skip if too short or generic
                if len(value) < 3 or value in ['a', 'an', 'the']:
                    continue
                
                memories.append({
                    'key': key,
                    'value': value,
                    'memory_type': 'fact',
                    'importance': 5,
                    'tags': ['fact', 'auto-extracted'],
                    'description': f'Fact about user: {value}'
                })
        
        return memories
    
    @staticmethod
    def _generate_key(text: str) -> str:
        """Generate a safe key from text"""
        # Remove special characters, convert to lowercase, replace spaces with underscores
        key = re.sub(r'[^a-z0-9\s]', '', text.lower())
        key = '_'.join(key.split())
        # Limit length
        key = key[:50]
        # Add timestamp suffix to ensure uniqueness
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        return f"{key}_{timestamp}"
    
    @classmethod
    def analyze_conversation_for_context(cls, messages: List[Dict]) -> Dict[str, any]:
        """
        Analyze conversation to extract context
        """
        context = {
            'topics': [],
            'sentiment': 'neutral',
            'technical_level': 'standard',
            'main_subject': None
        }
        
        # Extract topics from messages
        technical_keywords = ['code', 'programming', 'algorithm', 'api', 'database', 
                            'gpu', 'cpu', 'memory', 'server', 'deploy']
        creative_keywords = ['design', 'art', 'creative', 'idea', 'concept']
        
        all_text = ' '.join([msg.get('content', '') for msg in messages]).lower()
        
        # Detect technical level
        tech_count = sum(1 for kw in technical_keywords if kw in all_text)
        if tech_count > 3:
            context['technical_level'] = 'advanced'
        elif tech_count > 0:
            context['technical_level'] = 'intermediate'
        
        # Extract main topics
        words = re.findall(r'\b\w{4,}\b', all_text)
        word_freq = {}
        for word in words:
            if word not in ['that', 'this', 'with', 'from', 'have', 'been', 'would']:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Top 5 topics
        if word_freq:
            sorted_topics = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
            context['topics'] = [topic for topic, _ in sorted_topics[:5]]
            context['main_subject'] = sorted_topics[0][0] if sorted_topics else None
        
        return context
    
    @classmethod
    def should_store_memory(cls, memory: Dict, existing_keys: List[str]) -> Tuple[bool, str]:
        """
        Decide if a memory should be stored
        Returns (should_store, reason)
        """
        # Don't store if key already exists
        if memory['key'] in existing_keys:
            return False, "Key already exists"
        
        # Don't store if value is too short
        if len(memory['value'].strip()) < 2:
            return False, "Value too short"
        
        # Don't store low importance auto-extracted facts without explicit importance
        if memory['memory_type'] == 'fact' and memory['importance'] < 5:
            if 'explicit' not in memory.get('tags', []):
                return False, "Low importance auto-extracted fact"
        
        # Store high importance always
        if memory['importance'] >= 8:
            return True, "High importance"
        
        # Store explicit remember requests
        if 'explicit' in memory.get('tags', []):
            return True, "Explicit user request"
        
        # Store preferences
        if memory['memory_type'] == 'preference':
            return True, "User preference"
        
        # Store by default
        return True, "Valid memory"
    
    @classmethod
    def build_memory_summary(cls, memories: List[Dict]) -> str:
        """
        Build a human-readable summary of memories
        """
        if not memories:
            return "No memories stored yet."
        
        summary_parts = []
        
        # Group by type
        by_type = {}
        for mem in memories:
            mem_type = mem.get('memory_type', 'fact')
            if mem_type not in by_type:
                by_type[mem_type] = []
            by_type[mem_type].append(mem)
        
        # Build summary
        for mem_type, mems in by_type.items():
            type_emoji = {
                'fact': '📝',
                'preference': '⭐',
                'context': '🔄',
                'knowledge': '📚',
                'system': '⚙️'
            }.get(mem_type, '📌')
            
            summary_parts.append(f"\n{type_emoji} **{mem_type.upper()}** ({len(mems)}):")
            
            # Show top 3 by importance
            sorted_mems = sorted(mems, key=lambda x: x.get('importance', 0), reverse=True)
            for mem in sorted_mems[:3]:
                summary_parts.append(f"  • {mem.get('key', 'unknown')}: {mem.get('value', 'N/A')}")
        
        return '\n'.join(summary_parts)
    
    @classmethod
    def suggest_memory_importance(cls, memory: Dict) -> int:
        """
        Suggest importance level for a memory based on content
        """
        value = memory.get('value', '').lower()
        mem_type = memory.get('memory_type', 'fact')
        
        # Explicit remember requests
        if 'explicit' in memory.get('tags', []):
            return 10
        
        # Personal information
        if mem_type == 'preference' and any(word in value for word in ['name', 'birthday', 'email', 'phone']):
            return 9
        
        # System critical info
        if mem_type == 'system' and any(word in value for word in ['gpu', 'cpu', 'ram', 'version']):
            return 8
        
        # Preferences
        if mem_type == 'preference':
            return 7
        
        # Context
        if mem_type == 'context':
            return 6
        
        # Default facts
        return 5
