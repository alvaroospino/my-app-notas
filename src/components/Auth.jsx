// Auth.jsx
import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, // Asegúrate de importar updateProfile
  sendEmailVerification // <-- Importa sendEmailVerification
} from 'firebase/auth'; //
import { Eye, EyeOff, Mail, Lock, User, LogOut, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import './Auth.css';

function Auth({ currentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Validación básica del nombre de usuario
        if (username.trim().length < 2) {
          setError('El nombre de usuario debe tener al menos 2 caracteres.');
          setIsLoading(false); //
          return;
        }
        
        // Crear el usuario
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user; //
        
        // Actualizar el perfil con el nombre de usuario
        await updateProfile(user, { //
          displayName: username.trim()
        });
        
        // **AQUÍ: Envía el correo de verificación**
        await sendEmailVerification(user); //
        
        setSuccessMessage('¡Registro exitoso! Por favor, verifica tu correo electrónico para iniciar sesión.'); //
        setTimeout(() => {
          setIsRegistering(false);
          setEmail('');
          setPassword('');
          setUsername('');
          setSuccessMessage('');
        }, 5000); // Dale más tiempo al usuario para leer el mensaje
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMessage('¡Bienvenido de vuelta!');
      }
    } catch (err) {
      console.error("Error de autenticación:", err.message);
      let errorMessage = "Ocurrió un error inesperado.";
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo electrónico ya está registrado.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El formato del correo electrónico es inválido.';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Correo o contraseña incorrectos.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Intenta nuevamente más tarde.';
          break;
        default:
          errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setSuccessMessage('Sesión cerrada exitosamente.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Error al cerrar sesión:", err.message);
      setError('No se pudo cerrar la sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  if (currentUser) {
    return (
      <div className="auth-container">
        <div className="user-profile-card">
          <div className="profile-header">
            <div className="avatar">
              <User size={32} />
            </div>
            <div className="user-info">
              <h3>¡Bienvenido{currentUser.displayName ? `, ${currentUser.displayName}` : ''}!</h3>
              <p className="user-email">{currentUser.email}</p>
              {/* Nuevo: Muestra el estado de verificación del correo */}
              {!currentUser.emailVerified && (
                <p className="verification-status warning">
                  <AlertCircle size={16} /> Tu correo electrónico no ha sido verificado.
                  <button 
                    onClick={() => { /* Lógica para reenviar verificación */ }} 
                    className="resend-verification-button"
                  >
                    Reenviar verificación
                  </button>
                </p>
              )}
              {currentUser.emailVerified && (
                <p className="verification-status success">
                  <CheckCircle size={16} /> Correo verificado.
                </p>
              )}
            </div>
          </div>
          
          {successMessage && (
            <div className="message success-message">
              <CheckCircle size={16} />
              <span>{successMessage}</span>
            </div>
          )}
          
          {error && (
            <div className="message error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <button 
            onClick={handleLogout} 
            className="logout-button"
            disabled={isLoading}
          >
            <LogOut size={18} />
            {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          {/* Logo y nombre de la aplicación */}
          <div className="app-branding">
            <div className="app-logo">
              {/* Cambia este icono por el de tu aplicación */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                <path d="M8 12L16 8L24 12V20C24 22.2091 22.2091 24 20 24H12C9.79086 24 8 22.2091 8 20V12Z" fill="white" />
                <path d="M16 8V16" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="app-name">Mi Aplicación</h1>
          </div>
          
          {/* Título de la sección */}
          <div className="auth-section">
            <h2 className="auth-title">
              {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h2>
            <p className="auth-subtitle">
              {isRegistering 
                ? 'Únete a nuestra comunidad' 
                : 'Bienvenido de vuelta'
              }
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="message success-message">
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="message error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="auth-form">
          {/* Campo de nombre de usuario - solo para registro */}
          {isRegistering && (
            <div className="input-group">
              <div className="input-wrapper">
                <UserPlus className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="auth-input"
                  disabled={isLoading}
                  minLength={2}
                  maxLength={50}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            onClick={toggleAuthMode}
            className="toggle-mode-button"
            disabled={isLoading}
          >
            {isRegistering 
              ? '¿Ya tienes una cuenta? Inicia Sesión' 
              : '¿No tienes una cuenta? Regístrate'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;