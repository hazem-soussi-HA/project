import React, { useState, useEffect } from 'react';
import './ModelSelector.css';

const ModelSelector = ({ onModelChange, currentModel }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [pullingModel, setPullingModel] = useState(null);
  const [showPullForm, setShowPullForm] = useState(false);
  const [newModelName, setNewModelName] = useState('');

  useEffect(() => {
    loadModels();
    loadOllamaStatus();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/quantum-goose-app/api/models/');
      if (!response.ok) throw new Error('Failed to load models');
      const data = await response.json();
      setModels(data.models || []);
      setError(null);
    } catch (err) {
      setError('Failed to load models: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadOllamaStatus = async () => {
    try {
      const response = await fetch('/quantum-goose-app/api/models/status/');
      if (!response.ok) throw new Error('Failed to load Ollama status');
      const data = await response.json();
      setOllamaStatus(data.ollama_status);
    } catch (err) {
      console.error('Failed to load Ollama status:', err);
    }
  };

  const handleModelSelect = async (modelName) => {
    try {
      const response = await fetch('/quantum-goose-app/api/models/set/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelName })
      });

      if (!response.ok) throw new Error('Failed to set model');

      const data = await response.json();
      onModelChange && onModelChange(modelName);
      alert(`Model changed to: ${modelName}`);
    } catch (err) {
      alert('Failed to change model: ' + err.message);
    }
  };

  const handlePullModel = async () => {
    if (!newModelName.trim()) return;

    try {
      setPullingModel(newModelName);
      const response = await fetch('/quantum-goose-app/api/models/pull/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: newModelName })
      });

      if (!response.ok) throw new Error('Failed to start model pull');

      const data = await response.json();
      alert(data.message);
      setNewModelName('');
      setShowPullForm(false);

      // Reload models after a delay
      setTimeout(() => {
        loadModels();
        setPullingModel(null);
      }, 5000);
    } catch (err) {
      alert('Failed to pull model: ' + err.message);
      setPullingModel(null);
    }
  };

  const handleDeleteModel = async (modelName) => {
    if (!confirm(`Are you sure you want to delete model: ${modelName}?`)) return;

    try {
      const response = await fetch(`/quantum-goose-app/api/models/delete/?model=${encodeURIComponent(modelName)}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete model');

      const data = await response.json();
      alert(data.message);
      loadModels();
    } catch (err) {
      alert('Failed to delete model: ' + err.message);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  if (loading) {
    return (
      <div className="model-selector">
        <div className="model-selector-header">
          <h3>🧠 AI Models</h3>
        </div>
        <div className="loading">Loading models...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="model-selector">
        <div className="model-selector-header">
          <h3>🧠 AI Models</h3>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="model-selector">
      <div className="model-selector-header">
        <h3>🧠 AI Models</h3>
        <div className="model-stats">
          {ollamaStatus && (
            <span className="stats">
              {ollamaStatus.total_models} models • {ollamaStatus.total_size_gb} GB total
            </span>
          )}
        </div>
      </div>

      <div className="model-list">
        {models.map((model) => (
          <div key={model.name} className={`model-item ${model.name === currentModel ? 'active' : ''}`}>
            <div className="model-info">
              <div className="model-name">{model.name}</div>
              <div className="model-details">
                <span className="model-size">{formatSize(model.size)}</span>
                {model.modified_at && (
                  <span className="model-date">
                    {new Date(model.modified_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="model-actions">
              {model.name !== currentModel && (
                <button
                  className="btn-select"
                  onClick={() => handleModelSelect(model.name)}
                  disabled={pullingModel === model.name}
                >
                  {pullingModel === model.name ? 'Pulling...' : 'Select'}
                </button>
              )}
              {model.name === currentModel && (
                <span className="current-badge">Active</span>
              )}
              <button
                className="btn-delete"
                onClick={() => handleDeleteModel(model.name)}
                disabled={model.name === currentModel}
                title="Delete model"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="model-actions-footer">
        <button
          className="btn-pull-new"
          onClick={() => setShowPullForm(!showPullForm)}
        >
          {showPullForm ? 'Cancel' : '+ Pull New Model'}
        </button>

        {showPullForm && (
          <div className="pull-form">
            <input
              type="text"
              placeholder="Model name (e.g., llama2:13b)"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePullModel()}
            />
            <button onClick={handlePullModel} disabled={!newModelName.trim()}>
              Pull
            </button>
          </div>
        )}
      </div>

      {ollamaStatus && !ollamaStatus.ollama_available && (
        <div className="ollama-warning">
          ⚠️ Ollama service is not available. Please ensure Ollama is running.
        </div>
      )}
    </div>
  );
};

export default ModelSelector;