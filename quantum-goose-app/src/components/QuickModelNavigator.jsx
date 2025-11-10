import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuickModelNavigator.css';

const QuickModelNavigator = () => {
  const navigate = useNavigate();
  const [availableModels, setAvailableModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      
      // Try Django API first
      try {
        const response = await fetch('/quantum-goose-app/api/models/');
        const data = await response.json();
        
        if (data.status === 'success') {
          setAvailableModels(data.models || []);
          if (data.models?.length > 0) {
            setSelectedModel(data.current_model || data.models[0].name);
          }
          return;
        }
      } catch (djangoError) {
        console.log('Django API failed, trying direct Ollama:', djangoError.message);
      }
      
      // Fallback to direct Ollama API
      try {
        const ollamaResponse = await fetch('http://localhost:11434/api/tags');
        const ollamaData = await ollamaResponse.json();
        
        if (ollamaData.models) {
          const formattedModels = ollamaData.models.map(model => ({
            name: model.name,
            size: model.size,
            digest: model.digest,
            modified_at: model.modified_at,
            details: model.details,
            is_current: false
          }));
          
          setAvailableModels(formattedModels);
          if (formattedModels.length > 0) {
            setSelectedModel(formattedModels[0].name);
          }
        }
      } catch (ollamaError) {
        console.error('Failed to fetch models:', ollamaError);
      }
      
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = availableModels.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (model.details?.family || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (model.details?.parameter_size || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModelSelect = (modelName) => {
    setSelectedModel(modelName);
  };

  const handleStartChat = () => {
    if (selectedModel) {
      // Navigate to HAZoom LLM with model parameter
      navigate(`/hazoom-llm?model=${encodeURIComponent(selectedModel)}`);
    }
  };

  const getModelIcon = (model) => {
    const family = model.details?.family?.toLowerCase() || '';
    if (family.includes('llama')) return '🦙';
    if (family.includes('phi')) return '🧠';
    if (family.includes('qwen')) return '🌟';
    if (family.includes('mistral')) return '🌬️';
    if (family.includes('glm')) return '🔮';
    if (family.includes('minimax')) return '⚡';
    return '🤖';
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'Cloud';
    const gb = bytes / (1024 ** 3);
    return gb.toFixed(1) + ' GB';
  };

  const getModelDescription = (model) => {
    const family = model.details?.family || '';
    const size = model.details?.parameter_size || '';
    
    if (family.includes('llama')) return 'Meta\'s LLaMA - Versatile language model';
    if (family.includes('phi')) return 'Microsoft Phi - Small but capable';
    if (family.includes('qwen')) return 'Alibaba Qwen - Multilingual expert';
    if (family.includes('mistral')) return 'Mistral AI - Efficient performance';
    if (family.includes('glm')) return 'GLM - Chinese language specialist';
    if (family.includes('minimax')) return 'MiniMax - Cloud-based AI';
    return 'General purpose language model';
  };

  if (loading) {
    return (
      <div className="quick-model-navigator">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Loading available models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quick-model-navigator">
      <div className="navigator-header">
        <h1>🚀 Quick Model Navigator</h1>
        <p>Choose an AI model and start chatting instantly</p>
      </div>

      <div className="search-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search models by name, family, or size..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="models-grid">
        {filteredModels.length === 0 ? (
          <div className="no-models-found">
            <span className="no-models-icon">🔍</span>
            <h3>No models found</h3>
            <p>Try adjusting your search terms or check if models are installed</p>
            <button 
              onClick={() => window.location.href = '/models'}
              className="manage-models-btn"
            >
              Manage Models
            </button>
          </div>
        ) : (
          filteredModels.map((model) => (
            <div
              key={model.name}
              className={`model-card ${selectedModel === model.name ? 'selected' : ''}`}
              onClick={() => handleModelSelect(model.name)}
            >
              <div className="model-card-header">
                <div className="model-icon-large">
                  {getModelIcon(model)}
                </div>
                <div className="model-basic-info">
                  <h3>{model.name}</h3>
                  <div className="model-specs">
                    <span className="spec-tag">{model.details?.parameter_size || 'Unknown'}</span>
                    <span className="spec-tag">{model.details?.family || 'Unknown'}</span>
                  </div>
                </div>
                {selectedModel === model.name && (
                  <div className="selected-badge">✓</div>
                )}
              </div>
              
              <div className="model-description">
                <p>{getModelDescription(model)}</p>
              </div>
              
              <div className="model-details">
                <div className="detail-item">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">{formatSize(model.size)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Modified:</span>
                  <span className="detail-value">
                    {new Date(model.modified_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Quantization:</span>
                  <span className="detail-value">
                    {model.details?.quantization_level || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredModels.length > 0 && (
        <div className="action-section">
          <div className="selected-model-display">
            <span className="selected-label">Selected Model:</span>
            <span className="selected-model-name">
              {getModelIcon(availableModels.find(m => m.name === selectedModel) || {})}
              {' '}{selectedModel || 'None'}
            </span>
          </div>
          
          <button
            onClick={handleStartChat}
            disabled={!selectedModel}
            className="start-chat-btn"
          >
            <span className="btn-icon">💬</span>
            Start Chat with {selectedModel}
          </button>
        </div>
      )}

      <div className="footer-actions">
        <button 
          onClick={() => window.location.href = '/models'}
          className="secondary-btn"
        >
          ⚙️ Manage Models
        </button>
        <button 
          onClick={() => window.location.href = '/video-chat'}
          className="secondary-btn"
        >
          🎥 Video Chat
        </button>
      </div>
    </div>
  );
};

export default QuickModelNavigator;