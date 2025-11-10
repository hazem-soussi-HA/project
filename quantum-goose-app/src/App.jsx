/**
 * HAZoom SGI LLM - React Application
 * Copyright (c) 2024 Hazem Soussi, Cloud Engineer. All rights reserved.
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import SimpleAIChat from './components/SimpleAIChat';
import UserProfile from './components/UserProfile';
import SystemInfo from './components/SystemInfo';
import MemoryDashboard from './components/MemoryDashboard';
import MaxHazoomChat from './components/MaxHazoomChat';
import QuantumCubeUniverse from './components/QuantumCubeUniverse';
import QuantumNavigator from './components/QuantumNavigator';
import HAZoomLLMChat from './components/HAZoomLLMChat';
import HAZoomDroid from './components/HAZoomDroid';
import ModelManager from './components/ModelManager';
import QuantumTravel from './components/QuantumTravel';
import Legacy3DCube from './components/Legacy3DCube';
import MusicPlayer from './components/MusicPlayer';
import MagicTravelCube from './components/MagicTravelCube';
import QuantumHub from './components/QuantumHub';
import MobileCosmosApp from './components/MobileCosmosApp';
import VideoStreamingChat from './components/VideoStreamingChat';
import QuickModelNavigator from './components/QuickModelNavigator';
import './App.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Router>
      <div className={`App ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar onToggleCollapse={setSidebarCollapsed} />
        <Routes>
          <Route path="/" element={<Dashboard sidebarCollapsed={sidebarCollapsed} />} />
          <Route path="/dashboard" element={<Dashboard sidebarCollapsed={sidebarCollapsed} />} />
          <Route path="/llm/system-info" element={<SystemInfo />} />
          <Route path="/memory" element={<MemoryDashboard />} />
          <Route path="/chat" element={<SimpleAIChat />} />
          <Route path="/ai-chat" element={<SimpleAIChat />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/max-hazoom-chat" element={<MaxHazoomChat />} />
          <Route path="/quantum-cube" element={<QuantumCubeUniverse />} />
          <Route path="/quantum-navigator" element={<QuantumNavigator />} />
          <Route path="/hazoom-llm" element={<HAZoomLLMChat />} />
          <Route path="/droid" element={<HAZoomDroid />} />
          <Route path="/models" element={<ModelManager />} />
          <Route path="/travel" element={<QuantumTravel />} />
          <Route path="/legacy-cube" element={<Legacy3DCube />} />
          <Route path="/music" element={<MusicPlayer />} />
          <Route path="/magic-cube" element={<MagicTravelCube />} />
          <Route path="/quantum-hub" element={<QuantumHub />} />
          <Route path="/mobile-app" element={<MobileCosmosApp />} />
          <Route path="/video-chat" element={<VideoStreamingChat />} />
          <Route path="/quick-navigator" element={<QuickModelNavigator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
