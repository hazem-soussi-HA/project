/**
 * Memory Service for HAZoom LLM
 * Handles all memory operations with the Django backend
 */

const API_BASE_URL = 'http://localhost:9000/quantum-goose-app/api';

export class MemoryService {
  /**
   * Store a memory
   */
  static async storeMemory(userId, key, value, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/memory/store/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_identifier: userId,
          key: key,
          value: value,
          memory_type: options.type || 'fact',
          importance: options.importance || 5,
          tags: options.tags || [],
          description: options.description || ''
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to store memory: ${error.message}`);
    }
  }

  /**
   * Get a specific memory
   */
  static async getMemory(userId, key) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/memory/get/?user_identifier=${userId}&key=${key}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get memory: ${error.message}`);
    }
  }

  /**
   * Search memories
   */
  static async searchMemories(userId, query, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/memory/search/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_identifier: userId,
          query: query,
          memory_type: options.type,
          tags: options.tags || [],
          limit: options.limit || 10
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to search memories: ${error.message}`);
    }
  }

  /**
   * List all memories
   */
  static async listMemories(userId, options = {}) {
    try {
      const params = new URLSearchParams({
        user_identifier: userId,
        ...(options.type && { memory_type: options.type }),
        ...(options.minImportance && { min_importance: options.minImportance })
      });

      const response = await fetch(`${API_BASE_URL}/memory/list/?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to list memories: ${error.message}`);
    }
  }

  /**
   * Delete a memory
   */
  static async deleteMemory(userId, key) {
    try {
      const response = await fetch(`${API_BASE_URL}/memory/delete/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_identifier: userId,
          key: key
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to delete memory: ${error.message}`);
    }
  }

  /**
   * Update memory importance
   */
  static async updateImportance(userId, key, importance) {
    try {
      const response = await fetch(`${API_BASE_URL}/memory/importance/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_identifier: userId,
          key: key,
          importance: importance
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update importance: ${error.message}`);
    }
  }

  /**
   * Get memory statistics
   */
  static async getStats(userId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/memory/stats/?user_identifier=${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }

  /**
   * Search knowledge base
   */
  static async searchKnowledge(query, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/search/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          category: options.category,
          limit: options.limit || 5
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to search knowledge: ${error.message}`);
    }
  }

  /**
   * Get user preferences
   */
  static async getPreferences(userId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/preferences/get/?user_identifier=${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get preferences: ${error.message}`);
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(userId, preferences) {
    try {
      const response = await fetch(`${API_BASE_URL}/preferences/update/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_identifier: userId,
          ...preferences
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update preferences: ${error.message}`);
    }
  }

  /**
   * Extract potential memories from text
   * Uses pattern matching to identify facts worth remembering
   */
  static extractMemoriesFromText(text) {
    const memories = [];
    
    // Pattern: "My name is X" or "I'm X"
    const namePattern = /(?:my name is|i'm|i am) (\w+)/i;
    const nameMatch = text.match(namePattern);
    if (nameMatch) {
      memories.push({
        key: 'user_name',
        value: nameMatch[1],
        type: 'preference',
        importance: 8
      });
    }

    // Pattern: "I like X" or "I prefer X"
    const preferencePattern = /(?:i like|i prefer|i love) ([^.,!?]+)/i;
    const prefMatch = text.match(preferencePattern);
    if (prefMatch) {
      memories.push({
        key: `preference_${Date.now()}`,
        value: prefMatch[1].trim(),
        type: 'preference',
        importance: 6
      });
    }

    // Pattern: "Remember that X"
    const rememberPattern = /remember that ([^.,!?]+)/i;
    const rememberMatch = text.match(rememberPattern);
    if (rememberMatch) {
      memories.push({
        key: `important_${Date.now()}`,
        value: rememberMatch[1].trim(),
        type: 'fact',
        importance: 9
      });
    }

    return memories;
  }

  /**
   * Auto-save important information from conversation
   */
  static async autoSaveMemories(userId, text) {
    const extracted = this.extractMemoriesFromText(text);
    const results = [];

    for (const memory of extracted) {
      try {
        const result = await this.storeMemory(
          userId,
          memory.key,
          memory.value,
          {
            type: memory.type,
            importance: memory.importance,
            tags: ['auto-extracted']
          }
        );
        results.push(result);
      } catch (error) {
        console.error('Failed to auto-save memory:', error);
      }
    }

    return results;
  }
}

export default MemoryService;
