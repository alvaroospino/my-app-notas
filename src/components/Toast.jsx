// src/components/Toast.jsx
import React, { useEffect, useState } from 'react';
import './Toast.css';

function Toast({ message, duration = 3000, onClose, type = 'success' }) {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);

  // Efecto para mostrar animación de entrada
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Efecto para cerrar automáticamente el toast después de 'duration' ms
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(false);
      // Esperar a que termine la animación de salida antes de cerrar
      setTimeout(() => {
        onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration, onClose]);

  // Efecto para animar la barrita de progreso suavemente
  useEffect(() => {
    let frame;
    const start = performance.now();

    function updateProgress(timestamp) {
      const elapsed = timestamp - start;
      const percent = 100 - (elapsed / duration) * 100;
      setProgress(Math.max(0, percent));

      if (percent > 0) {
        frame = requestAnimationFrame(updateProgress);
      }
    }

    frame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frame);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'info':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`toast-container ${isVisible ? 'toast-visible' : 'toast-hidden'} toast-${type}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {getIcon()}
        </div>
        <div className="toast-message">{message}</div>
        <button 
          className="toast-close" 
          onClick={handleClose}
          aria-label="Cerrar notificación"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="toast-progress-container">
        <div className="toast-progress" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export default Toast;