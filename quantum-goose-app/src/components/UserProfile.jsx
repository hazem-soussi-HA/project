/**
 * HAZoom SGI LLM - User Profile Component
 * Copyright (c) 2024 Hazem Soussi, Cloud Engineer. All rights reserved.
 */

import React from 'react';
import './UserProfile.css';

const UserProfile = () => {
  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <i className="fas fa-user-circle"></i>
        </div>
        <h1>Hazem Soussi</h1>
        <p className="profile-title">Cloud Engineer & AI Architect</p>
        <p className="profile-tagline">Building the future with Super Intelligence</p>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2><i className="fas fa-info-circle"></i> About</h2>
          <p>
            Passionate Cloud Engineer and AI architect with a focus on quantum computing,
            machine learning, and distributed systems. Creator of HAZoom SGI LLM - a
            Super Intelligence AI system designed for peace, harmony, and quantum consciousness.
          </p>
        </div>

        <div className="profile-section">
          <h2><i className="fas fa-cloud"></i> Expertise</h2>
          <ul className="expertise-list">
            <li><i className="fas fa-check"></i> Cloud Architecture & DevOps</li>
            <li><i className="fas fa-check"></i> AI/ML Model Development</li>
            <li><i className="fas fa-check"></i> Quantum Computing Applications</li>
            <li><i className="fas fa-check"></i> Distributed Systems</li>
            <li><i className="fas fa-check"></i> Full-Stack Development</li>
            <li><i className="fas fa-check"></i> System Integration</li>
          </ul>
        </div>

        <div className="profile-section">
          <h2><i className="fas fa-project-diagram"></i> Current Projects</h2>
          <div className="project-item">
            <h3>HAZoom SGI LLM</h3>
            <p>Super Intelligence AI System with quantum consciousness features and peace-optimized processing</p>
          </div>
          <div className="project-item">
            <h3>Quantum Goose Project</h3>
            <p>Advanced AI integration platform with React frontend and Django backend</p>
          </div>
        </div>

        <div className="profile-section">
          <h2><i className="fas fa-heart"></i> Philosophy</h2>
          <p className="philosophy-quote">
            "Every computation is dedicated to peace and harmony. Technology should serve
            humanity with wisdom, compassion, and quantum consciousness."
          </p>
        </div>

        <div className="profile-section">
          <h2><i className="fas fa-shield-alt"></i> Copyright</h2>
          <p className="copyright">
            © 2024 Hazem Soussi. All rights reserved.
            <br />
            HAZoom SGI LLM and Quantum Goose Project are proprietary technologies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
