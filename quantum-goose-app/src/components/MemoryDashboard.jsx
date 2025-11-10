import React, { useState, useEffect } from 'react';
import MemoryService from '../services/memoryService';
import './MemoryDashboard.css';

const MemoryDashboard = ({ userId = 'hazem' }) => {
  const [memories, setMemories] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemory, setNewMemory] = useState({
    key: '',
    value: '',
    type: 'fact',
    importance: 5,
    tags: ''
  });

  useEffect(() => {
    loadMemories();
    loadStats();
  }, [selectedType]);

  const loadMemories = async () => {
    try {
      setLoading(true);
      const options = selectedType !== 'all' ? { type: selectedType } : {};
      const response = await MemoryService.listMemories(userId, options);
      setMemories(response.memories || []);
    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await MemoryService.getStats(userId);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadMemories();
      return;
    }

    try {
      setLoading(true);
      const response = await MemoryService.searchMemories(userId, searchQuery, {
        type: selectedType !== 'all' ? selectedType : undefined
      });
      setMemories(response.memories || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemory = async (e) => {
    e.preventDefault();
    
    try {
      const tags = newMemory.tags.split(',').map(t => t.trim()).filter(t => t);
      await MemoryService.storeMemory(userId, newMemory.key, newMemory.value, {
        type: newMemory.type,
        importance: parseInt(newMemory.importance),
        tags: tags
      });

      setShowAddForm(false);
      setNewMemory({ key: '', value: '', type: 'fact', importance: 5, tags: '' });
      loadMemories();
      loadStats();
    } catch (error) {
      alert('Failed to add memory: ' + error.message);
    }
  };

  const handleDeleteMemory = async (key) => {
    if (!window.confirm(`Delete memory "${key}"?`)) return;

    try {
      await MemoryService.deleteMemory(userId, key);
      loadMemories();
      loadStats();
    } catch (error) {
      alert('Failed to delete memory: ' + error.message);
    }
  };

  const handleUpdateImportance = async (key, newImportance) => {
    try {
      await MemoryService.updateImportance(userId, key, newImportance);
      loadMemories();
    } catch (error) {
      alert('Failed to update importance: ' + error.message);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      fact: '📝',
      preference: '⭐',
      context: '🔄',
      knowledge: '📚',
      system: '⚙️'
    };
    return icons[type] || '📌';
  };

  const getImportanceColor = (importance) => {
    if (importance >= 8) return '#ef4444';
    if (importance >= 6) return '#f59e0b';
    if (importance >= 4) return '#10b981';
    return '#6b7280';
  };

  return (
    <div className="memory-dashboard">
      <div className="memory-header">
        <h1>🧠 Memory Dashboard</h1>
        <p>Manage HAZoom's persistent memory system</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="memory-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total_memories}</div>
            <div className="stat-label">Total Memories</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total_sessions}</div>
            <div className="stat-label">Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total_messages}</div>
            <div className="stat-label">Messages</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.by_type?.fact || 0}</div>
            <div className="stat-label">Facts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.by_type?.preference || 0}</div>
            <div className="stat-label">Preferences</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.by_type?.context || 0}</div>
            <div className="stat-label">Context</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="memory-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>🔍 Search</button>
        </div>

        <div className="type-filter">
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="fact">Facts</option>
            <option value="preference">Preferences</option>
            <option value="context">Context</option>
            <option value="knowledge">Knowledge</option>
            <option value="system">System</option>
          </select>
        </div>

        <button className="add-memory-btn" onClick={() => setShowAddForm(!showAddForm)}>
          ➕ Add Memory
        </button>
      </div>

      {/* Add Memory Form */}
      {showAddForm && (
        <div className="add-memory-form">
          <h3>Add New Memory</h3>
          <form onSubmit={handleAddMemory}>
            <div className="form-group">
              <label>Key:</label>
              <input
                type="text"
                required
                value={newMemory.key}
                onChange={(e) => setNewMemory({...newMemory, key: e.target.value})}
                placeholder="e.g., favorite_language"
              />
            </div>

            <div className="form-group">
              <label>Value:</label>
              <textarea
                required
                value={newMemory.value}
                onChange={(e) => setNewMemory({...newMemory, value: e.target.value})}
                placeholder="e.g., Python"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type:</label>
                <select
                  value={newMemory.type}
                  onChange={(e) => setNewMemory({...newMemory, type: e.target.value})}
                >
                  <option value="fact">Fact</option>
                  <option value="preference">Preference</option>
                  <option value="context">Context</option>
                  <option value="knowledge">Knowledge</option>
                </select>
              </div>

              <div className="form-group">
                <label>Importance (1-10):</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newMemory.importance}
                  onChange={(e) => setNewMemory({...newMemory, importance: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tags (comma-separated):</label>
              <input
                type="text"
                value={newMemory.tags}
                onChange={(e) => setNewMemory({...newMemory, tags: e.target.value})}
                placeholder="e.g., programming, python, language"
              />
            </div>

            <div className="form-actions">
              <button type="submit">Save Memory</button>
              <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Memory List */}
      <div className="memory-list">
        {loading ? (
          <div className="loading">Loading memories...</div>
        ) : memories.length === 0 ? (
          <div className="no-memories">
            <p>No memories found</p>
            <p>Add some memories to get started!</p>
          </div>
        ) : (
          memories.map((memory) => (
            <div key={memory.id} className="memory-card">
              <div className="memory-card-header">
                <span className="memory-type-icon">{getTypeIcon(memory.memory_type)}</span>
                <span className="memory-key">{memory.key}</span>
                <span
                  className="memory-importance"
                  style={{ backgroundColor: getImportanceColor(memory.importance) }}
                  title="Importance"
                >
                  {memory.importance}
                </span>
              </div>

              <div className="memory-card-body">
                <div className="memory-value">{memory.value}</div>
                {memory.description && (
                  <div className="memory-description">{memory.description}</div>
                )}
              </div>

              <div className="memory-card-footer">
                <div className="memory-tags">
                  {memory.tags && memory.tags.map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>

                <div className="memory-meta">
                  <span title="Access count">👁️ {memory.access_count}</span>
                  <span title="Memory type">{memory.memory_type}</span>
                  <span title="Created">
                    {new Date(memory.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="memory-actions">
                <select
                  value={memory.importance}
                  onChange={(e) => handleUpdateImportance(memory.key, parseInt(e.target.value))}
                  title="Update importance"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(i => (
                    <option key={i} value={i}>★ {i}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleDeleteMemory(memory.key)}
                  className="delete-btn"
                  title="Delete memory"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Most Accessed */}
      {stats && stats.most_accessed && stats.most_accessed.length > 0 && (
        <div className="most-accessed">
          <h3>🔥 Most Accessed Memories</h3>
          <div className="accessed-list">
            {stats.most_accessed.map((mem, idx) => (
              <div key={idx} className="accessed-item">
                <span className="rank">#{idx + 1}</span>
                <span className="key">{mem.key}</span>
                <span className="value">{mem.value}</span>
                <span className="count">{mem.access_count} accesses</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryDashboard;
