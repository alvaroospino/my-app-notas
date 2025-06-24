// src/components/Sidebar.jsx
import React, { useEffect } from 'react';
import './Sidebar.css';

function Sidebar({ isOpen, onClose, onSelectFilter, onOpenTagManager, onLogout, onOpenProfilePage, currentFilter }) {
  // Prevenir scroll del body cuando el sidebar está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    
    // Cleanup cuando el componente se desmonta
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isOpen]);

  const handleFilterClick = (filter) => {
    onSelectFilter(filter);
    // onClose(); // Ya se llama en App.jsx al seleccionar el filtro
  };

  const menuItems = [
    { id: 'all', label: 'Todas las Notas', icon: '📝' },
    { id: 'unread', label: 'Notas a Revisar', icon: '👁️' },
    { id: 'fixed', label: 'Notas Fijadas', icon: '📌' },
    { id: 'old', label: 'Notas Antiguas', icon: '📚' },
    { id: 'archived', label: 'Notas Archivadas', icon: '📦' },
    { id: 'trash', label: 'Papelera', icon: '🗑️' }
  ];

  return (
    <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-header">
          <h3>✨ Menú</h3>
          <button className="close-sidebar-button" onClick={onClose} aria-label="Cerrar menú">
            ×
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {/* Items principales de filtro */}
          {menuItems.map((item) => (
            <button 
              key={item.id}
              className={`nav-item ${currentFilter === item.id ? 'active' : ''}`}
              onClick={() => handleFilterClick(item.id)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
          
          <hr />
          
          {/* Gestión */}
          <button className="nav-item" onClick={onOpenTagManager}>
            <span className="nav-item-icon">🏷️</span>
            Gestión de Etiquetas
          </button>
          
          <hr />
          
          {/* Perfil y sesión */}
          <button className="nav-item profile" onClick={onOpenProfilePage}>
            <span className="nav-item-icon">👤</span>
            Mi Perfil
          </button>
          
          <button className="nav-item danger" onClick={onLogout}>
            <span className="nav-item-icon">🚪</span>
            Cerrar Sesión
          </button>
        </nav>
      </aside>
    </div>
  );
}

export default Sidebar;