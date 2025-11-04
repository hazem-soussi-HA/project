import React, { useState, useEffect } from 'react';
import './Legacy3DCube.css';

const Legacy3DCube = ({ sidebarCollapsed = false }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [colorMode, setColorMode] = useState('normal');
  const [textIndex, setTextIndex] = useState(0);
  const [wisdomIndex, setWisdomIndex] = useState(0);

  const funnyTexts = [
    "💡 Fun Fact: This cube rotates so smoothly, it makes ice skaters jealous!",
    "🧠 Did you know? Cubes are just squares that went to the gym!",
    "🎯 Breaking News: Local cube refuses to be flat, becomes 3D overnight!",
    "⚡ Power Level: 3D APPROACHING!",
    "🎭 This cube is more well-rounded than a circle at a geometry party!",
    "🚀 Warning: Excessive cube rotation may cause dizziness and awesomeness!",
    "🌟 Fun Fact: Each face of this cube is playing hide and seek (poorly)!",
    "🎪 Behold! The cube that puts other shapes to shame!",
    "🏆 Award: Most awarded 3D object in web development (made up, but feels real)!",
    "🎭 This cube has 6 sides, and they're ALL stars!"
  ];

  const wisdoms = [
    "Hover over the cube to pause its rotation!",
    "Click the buttons below for cube manipulation!",
    "This cube is 100% certified organic and gluten-free!",
    "Warning: May cause spontaneous 3D enthusiasm!",
    "The cube says: 'I have all the right angles!'",
    "Fun fact: This cube has been rotating since 2024!",
    "The cube was created using pure CSS magic and JavaScript wizardry!",
    "This cube supports geometric equality for all shapes!",
    "Hovering makes the cube feel appreciated!",
    "Each face of this cube has its own unique personality!"
  ];

  const colorSchemes = {
    normal: [
      'linear-gradient(45deg, #ff6b6b, #ee5a52)',
      'linear-gradient(45deg, #4ecdc4, #44a08d)',
      'linear-gradient(45deg, #45b7d1, #96c93d)',
      'linear-gradient(45deg, #f093fb, #f5576c)',
      'linear-gradient(45deg, #4facfe, #00f2fe)',
      'linear-gradient(45deg, #43e97b, #38f9d7)'
    ],
    rainbow: [
      'linear-gradient(45deg, #667eea, #764ba2)',
      'linear-gradient(45deg, #f093fb, #f5576c)',
      'linear-gradient(45deg, #4facfe, #00f2fe)',
      'linear-gradient(45deg, #43e97b, #38f9d7)',
      'linear-gradient(45deg, #ff9a9e, #fecfef)',
      'linear-gradient(45deg, #a8edea, #fed6e3)'
    ],
    sunset: [
      'linear-gradient(45deg, #ff9a9e, #fecfef)',
      'linear-gradient(45deg, #fecfef, #ffecd2)',
      'linear-gradient(45deg, #fcb69f, #ff8a80)',
      'linear-gradient(45deg, #a8edea, #fed6e3)',
      'linear-gradient(45deg, #d299c2, #fef9d7)',
      'linear-gradient(45deg, #eec0c6, #fda085)'
    ],
    ocean: [
      'linear-gradient(45deg, #667eea, #764ba2)',
      'linear-gradient(45deg, #f093fb, #f5576c)',
      'linear-gradient(45deg, #4facfe, #00f2fe)',
      'linear-gradient(45deg, #43e97b, #38f9d7)',
      'linear-gradient(45deg, #a8edea, #fed6e3)',
      'linear-gradient(45deg, #d299c2, #fef9d7)'
    ]
  };

  useEffect(() => {
    // Cycle through funny texts
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % funnyTexts.length);
    }, 4000);

    // Cycle through wisdoms
    const wisdomInterval = setInterval(() => {
      setWisdomIndex((prev) => (prev + 1) % wisdoms.length);
    }, 6000);

    // Add floating emojis periodically
    const emojiInterval = setInterval(() => {
      addRandomEmoji();
    }, 3000);

    // Add some initial floating emojis
    const initialEmojis = setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => addRandomEmoji(), i * 1000);
      }
    }, 1000);

    return () => {
      clearInterval(textInterval);
      clearInterval(wisdomInterval);
      clearInterval(emojiInterval);
      clearTimeout(initialEmojis);
    };
  }, []);

  const pauseAnimation = () => {
    setIsPaused(!isPaused);
  };

  const changeSpeed = () => {
    setSpeedMultiplier(speedMultiplier === 1 ? 3 : 1);
  };

  const addRandomEmoji = () => {
    const emojis = ['🎉', '✨', '🌟', '🎈', '🎊', '💫', '🌈', '🦄', '🎭', '🚀', '⭐', '🎯'];
    const emoji = document.createElement('div');
    emoji.className = 'emoji';
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    emoji.style.left = Math.random() * window.innerWidth + 'px';
    emoji.style.top = Math.random() * window.innerHeight + 'px';
    emoji.style.animationDelay = Math.random() * 2 + 's';
    
    const floatingContainer = document.getElementById('floatingEmojis');
    if (floatingContainer) {
      floatingContainer.appendChild(emoji);
      
      setTimeout(() => {
        if (emoji.parentNode) {
          emoji.remove();
        }
      }, 6000);
    }
  };

  const changeColors = () => {
    const modes = Object.keys(colorSchemes);
    const currentIndex = modes.indexOf(colorMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setColorMode(nextMode);
  };

  const getSpeed = () => {
    return `${8 / speedMultiplier}s`;
  };

  const getAnimationState = () => {
    return isPaused ? 'paused' : 'running';
  };

  const getFaceStyles = () => {
    const scheme = colorSchemes[colorMode] || colorSchemes.normal;
    return {
      front: { background: scheme[0] },
      back: { background: scheme[1] },
      right: { background: scheme[2] },
      left: { background: scheme[3] },
      top: { background: scheme[4] },
      bottom: { background: scheme[5] }
    };
  };

  return (
    <div className="legacy-cube-container">
      <div className="floating-emojis" id="floatingEmojis"></div>
      
      <div className="container">
        <h1 className="title">🎲 The Amazing 3D Cube! 🎲</h1>
        <p className="subtitle">
          "The most revolutionary geometric discovery since... well, yesterday!"
        </p>
        
        <div className="scene">
          <div 
            className="cube" 
            style={{ 
              animationDuration: getSpeed(),
              animationPlayState: getAnimationState()
            }}
          >
            <div className="face front" style={getFaceStyles().front}>FRONT</div>
            <div className="face back" style={getFaceStyles().back}>BACK</div>
            <div className="face right" style={getFaceStyles().right}>RIGHT</div>
            <div className="face left" style={getFaceStyles().left}>LEFT</div>
            <div className="face top" style={getFaceStyles().top}>TOP</div>
            <div className="face bottom" style={getFaceStyles().bottom}>BOTTOM</div>
          </div>
        </div>
        
        <div className="funny-text">
          {funnyTexts[textIndex]}
        </div>
        
        <div className="controls">
          <button className="btn" onClick={pauseAnimation}>
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          <button className="btn" onClick={changeSpeed}>
            ⚡ {speedMultiplier === 1 ? 'Turbo Speed' : 'Normal Speed'}
          </button>
          <button className="btn" onClick={addRandomEmoji}>
            ✨ More Magic
          </button>
          <button className="btn" onClick={changeColors}>
            🌈 {colorMode.charAt(0).toUpperCase() + colorMode.slice(1)} Mode
          </button>
        </div>
      </div>

      <div className="info-panel">
        <h3>🧠 Cube Wisdom:</h3>
        <p>{wisdoms[wisdomIndex]}</p>
      </div>
    </div>
  );
};

export default Legacy3DCube;
