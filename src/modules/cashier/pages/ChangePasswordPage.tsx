import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Iconos ---
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07-2.3 2.3"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados para inputs y visibilidad
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validación simple
  const isValid = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = () => {
    if (isValid) {
      // Aquí iría la lógica real de cambio de contraseña con el backend
      console.log("Contraseña cambiada exitosamente");
      alert("¡Contraseña actualizada!");
      navigate(-1); // Regresa a la página anterior
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Header Simple */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <ArrowLeftIcon />
        </button>
      </div>

      <div style={styles.content}>
        <h1 style={styles.title}>Configura tu contraseña</h1>
        <p style={styles.subtitle}>
          Por seguridad, actualiza tu contraseña para continuar.
        </p>

        {/* Formulario */}
        <div style={styles.formContainer}>
          
          {/* Input Nueva Contraseña */}
          <div style={styles.inputGroup}>
            <div style={styles.inputIconLeft}><LockIcon /></div>
            <input 
              type={showNew ? "text" : "password"} 
              placeholder="Nueva contraseña"
              style={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button 
              onClick={() => setShowNew(!showNew)} 
              style={styles.inputIconRight}
            >
              {showNew ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* Input Confirmar Contraseña */}
          <div style={styles.inputGroup}>
            <div style={styles.inputIconLeft}><LockIcon /></div>
            <input 
              type={showConfirm ? "text" : "password"} 
              placeholder="Confirmar nueva contraseña"
              style={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button 
              onClick={() => setShowConfirm(!showConfirm)} 
              style={styles.inputIconRight}
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* Mensaje de error si no coinciden (opcional) */}
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
             <p style={{color: 'red', fontSize: '12px', marginTop: '-10px', marginBottom: '10px'}}>Las contraseñas no coinciden</p>
          )}

          {/* Botón de Acción */}
          <button 
            style={{
              ...styles.submitButton,
              backgroundColor: isValid ? '#E0E0E0' : '#E0E0E0', // Base gris
              backgroundImage: isValid ? 'linear-gradient(to right, #FF9F43, #FFB46A)' : 'none', // Naranja si es válido
              color: isValid ? '#fff' : '#999',
              cursor: isValid ? 'pointer' : 'not-allowed',
              transform: isValid ? 'translateY(0)' : 'none',
              boxShadow: isValid ? '0 4px 15px rgba(255, 159, 67, 0.3)' : 'none'
            }}
            disabled={!isValid}
            onClick={handleSubmit}
          >
            Cambiar Contraseña
          </button>

        </div>
      </div>
    </div>
  );
};

// --- Estilos ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#fff', // Fondo blanco limpio como en la imagen
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  header: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '10px',
    borderRadius: '50%',
    transition: 'background 0.2s',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '480px', // Ancho máximo para que parezca app móvil en pantallas grandes
    width: '100%',
    margin: '0 auto',
    padding: '20px 30px',
    boxSizing: 'border-box',
    justifyContent: 'center', // Centrar verticalmente un poco
    marginBottom: '100px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '10px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '40px',
    lineHeight: '1.5',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '18px 50px', // Espacio para iconos izq y der
    borderRadius: '16px',
    border: '1px solid #F0F0F0',
    backgroundColor: '#FAFAFA',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    color: '#333'
  },
  inputIconLeft: {
    position: 'absolute',
    left: '18px',
    display: 'flex',
    pointerEvents: 'none',
  },
  inputIconRight: {
    position: 'absolute',
    right: '18px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    padding: 0,
  },
  submitButton: {
    marginTop: '20px',
    padding: '18px',
    borderRadius: '16px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    width: '100%',
  }
};