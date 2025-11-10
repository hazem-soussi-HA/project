/**
 * LLM HAZoom Service - Frontend Integration
 * Connects React frontend to Django LLM backend with streaming support
 */

const API_BASE_URL = '/quantum-goose-app/api';
const API_LLM_BASE_URL = '/quantum-goose-app/api/llm';

export class LLMService {
  /**
   * Send message to LLM backend with streaming response
   */
  static async sendMessageStreaming(message, onToken, onComplete, onError) {
    try {
      const response = await fetch(`${API_LLM_BASE_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          stream: true,
          intelligence_level: 'super'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            const eventType = line.substring(6).trim();
            continue;
          }
          
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.substring(5).trim());
              
              if (data.token) {
                onToken(data.token);
              } else if (data.full_response) {
                onComplete(data.full_response);
              } else if (data.error) {
                onError(data.error);
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      onError(error.message);
    }
  }

  /**
   * Send message with complete response (non-streaming)
   */
  static async sendMessage(message, intelligenceLevel = 'super') {
    try {
      const response = await fetch(`${API_LLM_BASE_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          stream: false,
          intelligence_level: intelligenceLevel
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Get system information
   */
  static async getSystemInfo() {
    try {
      const response = await fetch(`${API_LLM_BASE_URL}/system-info/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get system info: ${error.message}`);
    }
  }

  /**
   * Get acceleration information
   */
  static async getAccelerationInfo() {
    try {
      const response = await fetch(`${API_LLM_BASE_URL}/acceleration/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get acceleration info: ${error.message}`);
    }
  }

  /**
   * Set intelligence level
   */
  static async setIntelligenceLevel(level) {
    try {
      const response = await fetch(`${API_LLM_BASE_URL}/intelligence/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ level })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to set intelligence level: ${error.message}`);
    }
  }

  /**
   * Clear conversation history
   */
  static async clearHistory() {
    try {
      const response = await fetch(`${API_LLM_BASE_URL}/clear/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to clear history: ${error.message}`);
    }
  }

  /**
   * Get chat statistics
   */
  static async getChatStats() {
    try {
      const response = await fetch(`${API_LLM_BASE_URL}/stats/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get chat stats: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  static async healthCheck() {
    try {
      const response = await fetch(`${API_LLM_BASE_URL}/health/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to check health: ${error.message}`);
    }
  }

  /**
   * Get list of available models
   */
  static async getAvailableModels() {
    try {
      const response = await fetch(`${API_BASE_URL}/models/legacy/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get models: ${error.message}`);
    }
  }

  /**
   * Set active model
   */
  static async setModel(modelName) {
    try {
      const response = await fetch(`${API_BASE_URL}/models/legacy/set/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: modelName })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to set model: ${error.message}`);
    }
  }

  /**
   * Pull a new model
   */
  static async pullModel(modelName) {
    try {
      const response = await fetch(`${API_BASE_URL}/models/legacy/pull/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: modelName })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to pull model: ${error.message}`);
    }
  }

  /**
   * Delete a model
   */
  static async deleteModel(modelName) {
    try {
      const response = await fetch(`${API_BASE_URL}/models/legacy/delete/?model=${encodeURIComponent(modelName)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to delete model: ${error.message}`);
    }
  }

  /**
   * Get Ollama status
   */
  static async getOllamaStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/models/legacy/status/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get Ollama status: ${error.message}`);
    }
  }
}

export default LLMService;
