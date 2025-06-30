
import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
  vx: number;
  vy: number;
}

const CursorEffects = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationId: number;
    
    const updateParticles = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          opacity: particle.opacity - 0.02,
          scale: particle.scale * 0.98
        })).filter(particle => particle.opacity > 0)
      );
      animationId = requestAnimationFrame(updateParticles);
    };

    animationId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Create new particles on mouse move
      const newParticles: Particle[] = [];
      for (let i = 0; i < 3; i++) {
        newParticles.push({
          id: Date.now() + i,
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          opacity: 1,
          scale: 1,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2
        });
      }
      
      setParticles(prev => [...prev.slice(-20), ...newParticles]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Cursor Trail */}
      <div
        className="fixed pointer-events-none z-50 w-6 h-6 rounded-full bg-gradient-to-r from-magenta-400 to-purple-400 opacity-30 blur-sm transition-all duration-100"
        style={{
          left: mousePos.x - 12,
          top: mousePos.y - 12,
        }}
      />
      
      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed pointer-events-none z-40 w-2 h-2 rounded-full bg-gradient-to-r from-magenta-300 to-pink-400"
          style={{
            left: particle.x,
            top: particle.y,
            opacity: particle.opacity,
            transform: `scale(${particle.scale})`,
          }}
        />
      ))}
      
      {/* Dynamic Background Gradients */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-20"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(217, 70, 239, 0.15), transparent 50%)`,
        }}
      />
    </>
  );
};

export default CursorEffects;
