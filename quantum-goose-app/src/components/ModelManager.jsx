import React, { useState, useEffect } from 'react';
import './ModelManager.css';

const ModelManager = () => {
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState('');
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pullingModel, setPullingModel] = useState('');
  const [selectedModelInfo, setSelectedModelInfo] = useState(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try Django API first
      try {
        const response = await fetch('/quantum-goose-app/api/models/');
        const data = await response.json();
        
        if (data.status === 'success') {
          setModels(data.models || []);
          setCurrentModel(data.current_model || '');
          setOllamaAvailable(true);
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
            is_current: model.name === currentModel
          }));
          
          setModels(formattedModels);
          setOllamaAvailable(true);
          
          if (!currentModel && formattedModels.length > 0) {
            setCurrentModel(formattedModels[0].name);
          }
        }
      } catch (ollamaError) {
        console.error('Ollama API failed:', ollamaError.message);
        setOllamaAvailable(false);
        setError('Both Django and Ollama APIs are unavailable. Please ensure the backend services are running.');
      }
      
    } catch (err) {
      setError('Network error: ' + err.message);
      setOllamaAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const setModel = async (modelName) => {
    try {
      setError('');
      
      // Try Django API first
      try {
        const response = await fetch('/quantum-goose-app/api/models/legacy/set/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model: modelName }),
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
          setCurrentModel(modelName);
          fetchModels(); // Refresh
          return;
        }
      } catch (djangoError) {
        console.log('Django set model failed, using local state:', djangoError.message);
      }
      
      // Fallback to local state update
      setCurrentModel(modelName);
      fetchModels(); // Refresh to update is_current flags
      
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  const pullModel = async (modelName) => {
    try {
      setPullingModel(modelName);
      setError('');
      
      // Try Django API first
      try {
        const response = await fetch('/quantum-goose-app/api/models/legacy/pull/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model: modelName }),
        });
        
        const data = await response.json();
        
        if (data.status === 'started') {
          startPolling(modelName);
          return;
        }
      } catch (djangoError) {
        console.log('Django pull failed, trying direct Ollama:', djangoError.message);
      }
      
      // Fallback to direct Ollama API
      try {
        const response = await fetch('http://localhost:11434/api/pull', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: modelName }),
        });
        
        if (response.ok) {
          startPolling(modelName);
        } else {
          throw new Error('Failed to start model pull');
        }
      } catch (ollamaError) {
        setError('Failed to pull model: ' + ollamaError.message);
        setPullingModel('');
      }
      
    } catch (err) {
      setError('Network error: ' + err.message);
      setPullingModel('');
    }
  };

  const startPolling = (modelName) => {
    // Start polling for model availability
    const pollInterval = setInterval(() => {
      fetchModels();
      // Check if model is now available
      const modelExists = models.some(m => m.name === modelName);
      if (modelExists) {
        clearInterval(pollInterval);
        setPullingModel('');
      }
    }, 5000);
    
    // Stop polling after 5 minutes max
    setTimeout(() => {
      clearInterval(pollInterval);
      setPullingModel('');
    }, 300000);
  };

  const deleteModel = async (modelName) => {
    if (!window.confirm(`Are you sure you want to delete model "${modelName}"?`)) {
      return;
    }

    try {
      setError('');
      
      // Try Django API first
      try {
        const response = await fetch(`/quantum-goose-app/api/models/legacy/delete/?model=${encodeURIComponent(modelName)}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
          fetchModels(); // Refresh
          if (selectedModelInfo?.name === modelName) {
            setSelectedModelInfo(null);
          }
          return;
        }
      } catch (djangoError) {
        console.log('Django delete failed, trying direct Ollama:', djangoError.message);
      }
      
      // Fallback to direct Ollama API
      try {
        const response = await fetch('http://localhost:11434/api/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: modelName }),
        });
        
        if (response.ok) {
          fetchModels(); // Refresh
          if (selectedModelInfo?.name === modelName) {
            setSelectedModelInfo(null);
          }
        } else {
          throw new Error('Failed to delete model');
        }
      } catch (ollamaError) {
        setError('Failed to delete model: ' + ollamaError.message);
      }
      
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  const getModelInfo = async (modelName) => {
    try {
      setError('');
      
      // Try Django API first
      try {
        const response = await fetch(`/quantum-goose-app/api/models/legacy/info/?model=${encodeURIComponent(modelName)}`);
        const data = await response.json();
        
        if (data.status === 'success') {
          setSelectedModelInfo(data.info);
          return;
        }
      } catch (djangoError) {
        console.log('Django model info failed, trying direct Ollama:', djangoError.message);
      }
      
      // Fallback to direct Ollama API
      try {
        const response = await fetch('http://localhost:11434/api/show', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: modelName }),
        });
        
        const data = await response.json();
        
        if (data) {
          setSelectedModelInfo({
            name: modelName,
            model: modelName,
            details: data.details,
            template: data.template,
            license: data.license,
            ...data
          });
        } else {
          throw new Error('No model info received');
        }
      } catch (ollamaError) {
        setError('Failed to get model info: ' + ollamaError.message);
      }
      
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const gb = bytes / (1024 ** 3);
    return gb.toFixed(2) + ' GB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const popularModels = [
    'glm-4.6:cloud',
    'llama3.2:latest',
    'mistral:latest',
    'codellama:latest',
    'phi3:latest',
    'gemma2:latest'
  ];

  if (loading) {
    return (
      <div className="model-manager">
        <div className="loading">Loading models...</div>
      </div>
    );
  }

  return (
    <div className="model-manager">
      <div className="model-header">
        <h2>🤖 Quantum Model Manager</h2>
        <div className="status-indicator">
          <span className={`status-dot ${ollamaAvailable ? 'online' : 'offline'}`}></span>
          <span>Ollama {ollamaAvailable ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="model-content">
        <div className="models-section">
          <div className="section-header">
            <h3>Available Models</h3>
            <button onClick={fetchModels} className="refresh-btn">🔄 Refresh</button>
          </div>

          {ollamaAvailable ? (
            <div className="models-grid">
              {models.length === 0 ? (
                <div className="no-models">
                  <p>No models installed. Pull one below to get started!</p>
                </div>
              ) : (
                models.map((model) => (
                  <div 
                    key={model.name} 
                    className={`model-card ${model.name === currentModel ? 'current' : ''}`}
                  >
                    <div className="model-header-info">
                      <h4>{model.name}</h4>
                      {model.name === currentModel && (
                        <span className="current-badge">Current</span>
                      )}
                    </div>
                    
                    <div className="model-details">
                      <p>Size: {formatSize(model.size)}</p>
                      <p>Modified: {formatDate(model.modified_at)}</p>
                    </div>

                    <div className="model-actions">
                      {model.name !== currentModel && (
                        <button 
                          onClick={() => setModel(model.name)}
                          className="set-btn"
                        >
                          Set Active
                        </button>
                      )}
                      
                      <button 
                        onClick={() => getModelInfo(model.name)}
                        className="info-btn"
                      >
                        ℹ️ Info
                      </button>
                      
                      <button 
                        onClick={() => deleteModel(model.name)}
                        className="delete-btn"
                        disabled={model.name === currentModel}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="ollama-offline">
              <h3>🔌 Ollama is Offline</h3>
              <p>Please start Ollama to manage models:</p>
              <code>ollama serve</code>
            </div>
          )}

          <div className="pull-model-section">
            <h3>Pull New Model</h3>
            <div className="popular-models">
              <p>Popular models:</p>
              <div className="popular-models-grid">
                {popularModels.map((model) => (
                  <button
                    key={model}
                    onClick={() => pullModel(model)}
                    disabled={pullingModel === model || !ollamaAvailable}
                    className="pull-btn"
                  >
                    {pullingModel === model ? '⏳ Pulling...' : `⬇️ ${model}`}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="custom-pull">
              <p>Or pull a custom model:</p>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const modelName = formData.get('model');
                  if (modelName) pullModel(modelName);
                }}
              >
                <input 
                  type="text" 
                  name="model" 
                  placeholder="e.g., llama3.2:3b"
                  disabled={!ollamaAvailable}
                />
                <button type="submit" disabled={!ollamaAvailable}>
                  Pull Model
                </button>
              </form>
            </div>
          </div>
        </div>

        {selectedModelInfo && (
          <div className="model-info-panel">
            <div className="info-header">
              <h3>Model Information</h3>
              <button onClick={() => setSelectedModelInfo(null)}>×</button>
            </div>
            
            <div className="info-content">
              <h4>{selectedModelInfo.model || selectedModelInfo.name}</h4>
              
              {selectedModelInfo.details && (
                <div className="model-specs">
                  <h5>Specifications:</h5>
                  <ul>
                    <li>Format: {selectedModelInfo.details.format || 'Unknown'}</li>
                    <li>Family: {selectedModelInfo.details.family || 'Unknown'}</li>
                    <li>Parameter Size: {selectedModelInfo.details.parameter_size || 'Unknown'}</li>
                    <li>Quantization Level: {selectedModelInfo.details.quantization_level || 'Unknown'}</li>
                  </ul>
                </div>
              )}
              
              {selectedModelInfo.template && (
                <div className="model-template">
                  <h5>Template:</h5>
                  <pre>{selectedModelInfo.template}</pre>
                </div>
              )}
              
              {selectedModelInfo.license && (
                <div className="model-license">
                  <h5>License:</h5>
                  <p>{selectedModelInfo.license}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelManager;