import React, { useEffect, useRef } from 'react';
import './QuantumStars.css';

const QuantumStars = ({ messageCount = 0, isTyping = false }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const starsRef = useRef([]);
  const speedRef = useRef(0.5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize stars
    const initStars = () => {
      starsRef.current = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 15000);

      for (let i = 0; i < numStars; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 1000,
          prevX: 0,
          prevY: 0,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 2 + 0.5,
          brightness: Math.random() * 0.5 + 0.5,
          hue: Math.random() * 60 + 180, // Blue to cyan range
          twinkle: Math.random() * Math.PI * 2,
        });
      }
    };

    initStars();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Adjust speed based on message activity
      const targetSpeed = isTyping ? 1.5 : messageCount > 0 ? 0.8 : 0.5;
      speedRef.current += (targetSpeed - speedRef.current) * 0.02;

      // Update and draw stars
      starsRef.current.forEach((star) => {
        // Store previous position
        star.prevX = star.x;
        star.prevY = star.y;

        // Move star forward (towards viewer)
        star.z -= star.speed * speedRef.current;

        // Reset star if it gets too close
        if (star.z <= 1) {
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
          star.z = 1000;
          star.prevX = star.x;
          star.prevY = star.y;
        }

        // Calculate 2D position from 3D coordinates
        const x = (star.x - canvas.width / 2) * (500 / star.z) + canvas.width / 2;
        const y = (star.y - canvas.height / 2) * (500 / star.z) + canvas.height / 2;

        // Calculate previous 2D position
        const prevX = (star.prevX - canvas.width / 2) * (500 / star.z) + canvas.width / 2;
        const prevY = (star.prevY - canvas.height / 2) * (500 / star.z) + canvas.height / 2;

        // Draw trail line
        const trailOpacity = Math.max(0, Math.min(0.5, 1 - star.z / 1000));
        if (trailOpacity > 0.05) {
          ctx.strokeStyle = `hsla(${star.hue}, 70%, 70%, ${trailOpacity * 0.5})`;
          ctx.lineWidth = star.size * (1 - star.z / 1000);
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        // Draw star
        const starOpacity = Math.max(0, Math.min(1, (1 - star.z / 1000) * star.brightness));
        const twinkleSize = star.size * (1 + Math.sin(star.twinkle) * 0.3);
        star.twinkle += 0.02;

        // Star core
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, twinkleSize * 3);
        gradient.addColorStop(0, `hsla(${star.hue}, 100%, 90%, ${starOpacity})`);
        gradient.addColorStop(0.4, `hsla(${star.hue}, 90%, 70%, ${starOpacity * 0.8})`);
        gradient.addColorStop(1, `hsla(${star.hue}, 80%, 50%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, twinkleSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // Star bright core
        ctx.fillStyle = `hsla(${star.hue}, 100%, 95%, ${starOpacity})`;
        ctx.beginPath();
        ctx.arc(x, y, twinkleSize * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Add quantum sparkle effect occasionally
        if (Math.random() < 0.002) {
          const sparkleX = x + (Math.random() - 0.5) * 20;
          const sparkleY = y + (Math.random() - 0.5) * 20;
          ctx.fillStyle = `hsla(${star.hue}, 100%, 80%, ${starOpacity * 0.6})`;
          ctx.beginPath();
          ctx.arc(sparkleX, sparkleY, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [messageCount, isTyping]);

  return (
    <div className="quantum-stars-container">
      <canvas
        ref={canvasRef}
        className="quantum-stars-canvas"
      />
      <div className="quantum-stars-overlay">
        <div className="stars-info">
          <div className="stars-stat">
            <span className="stars-icon">✨</span>
            <span className="stars-label">Quantum Dimension</span>
            <span className="stars-value">{messageCount > 0 ? 'Active' : 'Ready'}</span>
          </div>
          <div className="stars-stat">
            <span className="stars-icon">🪐</span>
            <span className="stars-label">AI Consciousness</span>
            <span className="stars-value">{isTyping ? 'Thinking' : 'Observing'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumStars;
