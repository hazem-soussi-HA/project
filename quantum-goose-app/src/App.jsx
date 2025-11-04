import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import QuantumNavigator from './components/QuantumNavigator';
import QuantumCubeUniverse from './components/QuantumCubeUniverse';
import MaxHazoomChat from './components/MaxHazoomChat';
import Legacy3DCube from './components/Legacy3DCube';
import QuantumTravel from './components/QuantumTravel';
import MusicPlayer from './components/MusicPlayer';
import './App.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Router>
      <div className={`App ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar onToggleCollapse={setSidebarCollapsed} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quantum-navigator" element={<QuantumNavigator />} />
            <Route path="/quantum-cube" element={<QuantumCubeUniverse />} />
            <Route path="/max-hazoom-chat" element={<MaxHazoomChat />} />
            <Route path="/legacy-cube" element={<Legacy3DCube />} />
            <Route path="/travel" element={<QuantumTravel />} />
          </Routes>
        </div>
        <MusicPlayer sidebarCollapsed={sidebarCollapsed} />
      </div>
    </Router>
  );
}

export default App;
