
import React, { useEffect, useState, useRef } from 'react';

const CursorEffects = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const animationRef = useRef<number>();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    // Add event listeners to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, [role="button"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  useEffect(() => {
    const animateCursor = () => {
      setCursorPos(prev => ({
        x: prev.x + (mousePos.x - prev.x) * 0.1,
        y: prev.y + (mousePos.y - prev.y) * 0.1
      }));
      animationRef.current = requestAnimationFrame(animateCursor);
    };

    animationRef.current = requestAnimationFrame(animateCursor);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePos]);

  return (
    <>
      {/* Main cursor */}
      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: cursorPos.x - 8,
          top: cursorPos.y - 8,
          transform: `scale(${isHovering ? 1.5 : 1})`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        <div className="w-4 h-4 rounded-full bg-red-500 mix-blend-difference"></div>
      </div>
      
      {/* Trailing cursor */}
      <div
        className="fixed pointer-events-none z-40"
        style={{
          left: mousePos.x - 20,
          top: mousePos.y - 20,
          transform: `scale(${isHovering ? 1.2 : 1})`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        <div className="w-10 h-10 rounded-full border-2 border-red-400 opacity-50"></div>
      </div>
      
      {/* Dynamic Background Gradients */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-20"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(239, 68, 68, 0.15), transparent 50%)`,
        }}
      />
    </>
  );
};

export default CursorEffects;
