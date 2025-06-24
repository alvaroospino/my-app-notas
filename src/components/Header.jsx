// src/components/Header.jsx
import React from 'react';
import './Header.css'; // Asegúrate de que este archivo exista

// Añade isOnline a las props
function Header({ onSearch, onToggleSidebar, currentUser, isOnline }) { //
  return (
    <header className="app-header">
      <div className="header-left">
        <button className="menu-button" onClick={onToggleSidebar}>
          ☰
        </button>
        <h1 className="app-title">Notas Rápidas</h1>
      </div>
      <div className="header-center">
        <input
          type="text"
          placeholder="Buscar notas..."
          className="search-input"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="header-right">
        {currentUser ? (
          <span className="user-info">
            ¡Hola, {currentUser.displayName || currentUser.email}!
          </span>
        ) : (
          <span className="user-info">Invitado</span>
        )}

        {/* ICONO DE ESTADO DE CONEXIÓN */}
        <span
          className={`connection-status-icon ${isOnline ? 'online' : 'offline'}`} //
          title={isOnline ? 'Conectado a internet' : 'Sin conexión a internet'} // Tooltip útil
        >
          {isOnline ? '🌐' : '🚫'} {/* Emojis representativos */}
        </span>
      </div>
    </header>
  );
}

export default Header;