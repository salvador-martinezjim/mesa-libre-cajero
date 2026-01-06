import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Importamos el servicio nuevo
import { changePasswordService } from '../services/usersServices';

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
  
  // Estados para inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados de interfaz
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // NUEVO: Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isValid = currentPassword.length > 0 && newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      // Llamada al backend
      await changePasswordService(currentPassword, newPassword, confirmPassword);
      
      // Éxito
      alert("¡Contraseña actualizada correctamente!");
      navigate(-1); 

    } catch (error: any) {
      // Manejo de error
      console.error(error);
      if (error.response && error.response.status === 400) {
          setErrorMsg("La contraseña actual es incorrecta o los datos no son válidos.");
      } else {
          setErrorMsg("Ocurrió un error al intentar cambiar la contraseña.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <ArrowLeftIcon />
        </button>
      </div>

      <div style={styles.content}>
        <h1 style={styles.title}>Configura tu contraseña</h1>
        <p style={styles.subtitle}>
          Por seguridad, ingresa tu contraseña actual y luego la nueva.
        </p>

        {/* Mensaje de Error Visual */}
        {errorMsg && (
            <div style={{backgroundColor: '#FFEBEB', color: '#FF4C4C', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center'}}>
                {errorMsg}
            </div>
        )}

        <div style={styles.formContainer}>
          
          {/* Contraseña Actual */}
          <div style={styles.inputGroup}>
            <div style={styles.inputIconLeft}><LockIcon /></div>
            <input 
              type={showCurrent ? "text" : "password"} 
              placeholder="Contraseña actual"
              style={styles.input}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
            />
            <button onClick={() => setShowCurrent(!showCurrent)} style={styles.inputIconRight}>
              {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* Nueva Contraseña */}
          <div style={styles.inputGroup}>
            <div style={styles.inputIconLeft}><LockIcon /></div>
            <input 
              type={showNew ? "text" : "password"} 
              placeholder="Nueva contraseña"
              style={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <button onClick={() => setShowNew(!showNew)} style={styles.inputIconRight}>
              {showNew ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* Confirmar Contraseña */}
          <div style={styles.inputGroup}>
            <div style={styles.inputIconLeft}><LockIcon /></div>
            <input 
              type={showConfirm ? "text" : "password"} 
              placeholder="Confirmar nueva contraseña"
              style={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            <button onClick={() => setShowConfirm(!showConfirm)} style={styles.inputIconRight}>
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
             <p style={{color: 'red', fontSize: '12px', marginTop: '-10px', marginBottom: '10px'}}>Las contraseñas nuevas no coinciden</p>
          )}

          <button 
            style={{
              ...styles.submitButton,
              backgroundColor: isValid && !loading ? '#E0E0E0' : '#E0E0E0', 
              backgroundImage: isValid && !loading ? 'linear-gradient(to right, #FF9F43, #FFB46A)' : 'none',
              color: isValid && !loading ? '#fff' : '#999',
              cursor: isValid && !loading ? 'pointer' : 'not-allowed',
              transform: isValid && !loading ? 'translateY(0)' : 'none',
              boxShadow: isValid && !loading ? '0 4px 15px rgba(255, 159, 67, 0.3)' : 'none',
              opacity: loading ? 0.7 : 1
            }}
            disabled={!isValid || loading}
            onClick={handleSubmit}
          >
            {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
          </button>

        </div>
      </div>
    </div>
  );
};

// --- Estilos ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#fff', 
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
    maxWidth: '480px', 
    width: '100%',
    margin: '0 auto',
    padding: '20px 30px',
    boxSizing: 'border-box',
    justifyContent: 'center', 
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
    padding: '18px 50px', 
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