// src/components/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import './ProfilePage.css'; // Crearás este archivo CSS

function ProfilePage({ currentUser, onClose, onUpdateProfile, onChangePassword, onLogout }) {
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [message, setMessage] = useState('');

  // Sincroniza el displayName si cambia el currentUser o si el componente se monta con un displayName existente
  useEffect(() => {
    setDisplayName(currentUser?.displayName || '');
  }, [currentUser]);

  const handleUpdateDisplayName = async (e) => {
    e.preventDefault();
    setMessage('');
    if (displayName.trim() === '') {
      setMessage('El nombre de usuario no puede estar vacío.');
      return;
    }
    await onUpdateProfile(displayName);
    setMessage('Nombre de usuario actualizado con éxito.');
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setMessage('');

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await onChangePassword(newPassword);
      setNewPassword('');
      setConfirmNewPassword('');
      setMessage('Contraseña actualizada. Puede que necesites iniciar sesión de nuevo.');
      // onLogout(); // App.jsx ya llama a logout si es necesario
    } catch (error) {
      // El error ya se maneja en App.jsx, aquí solo mostramos el mensaje si App.jsx no lo hace
      setPasswordError('Error al cambiar la contraseña. Asegúrate de haber iniciado sesión recientemente.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-page-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Mi Perfil</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-content">
          {message && <p className="profile-message">{message}</p>}

          <section className="profile-section">
            <h3>Información de Cuenta</h3>
            <p><strong>Email:</strong> {currentUser?.email}</p>
            <form onSubmit={handleUpdateDisplayName} className="profile-form">
              <label htmlFor="displayName">Nombre de Usuario:</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre de usuario"
                className="profile-input"
              />
              <button type="submit" className="profile-button update-button">Actualizar Nombre</button>
            </form>
          </section>

          <section className="profile-section">
            <h3>Cambiar Contraseña</h3>
            <form onSubmit={handleChangePasswordSubmit} className="profile-form">
              {passwordError && <p className="profile-error">{passwordError}</p>}
              <label htmlFor="newPassword">Nueva Contraseña:</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="profile-input"
                required
              />
              <label htmlFor="confirmNewPassword">Confirmar Contraseña:</label>
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="profile-input"
                required
              />
              <button type="submit" className="profile-button change-password-button">Cambiar Contraseña</button>
            </form>
          </section>

          <section className="profile-section">
            <h3>Acciones de Sesión</h3>
            <button onClick={onLogout} className="profile-button logout-button">Cerrar Sesión</button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;