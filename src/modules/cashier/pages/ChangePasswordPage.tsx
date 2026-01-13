import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// IMPORTANTE: Sube 3 niveles igual que en el login
import api from '../../../api/axiosInstance';

// ... Iconos ...
const ArrowLeftIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>);
const LockIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>);
const EyeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const EyeOffIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07-2.3 2.3"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>);

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isValid = currentPassword.length > 0 && newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async () => {
    if (isValid) {
      try {
        // CORRECCIÓN: Usamos los nombres exactos del SCHEMA de Swagger
        const payload = {
          contraseñaActual: currentPassword,           
          contraseñaNueva: newPassword,        
          confirmacionContraseñaNueva: confirmPassword // Nota que es 'confirmacion', no 'confirmar'
        };

        console.log("Enviando cambio de pass:", payload);

        // LLAMADA AL ENDPOINT
        await api.post('/users/me/update-password', payload);

        // ÉXITO
        alert("¡Contraseña actualizada correctamente! Ahora eres un usuario Activo.");
        
        // Actualizamos local storage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.estado = 'Activo'; 
        localStorage.setItem('userData', JSON.stringify(userData));

        // Usamos window.location para asegurar que se actualicen los permisos
        window.location.href = '/mesas'; 

      } catch (error: any) {
        console.error("Error al cambiar contraseña:", error);
        
        // Manejo de errores específico
        if (error.response?.data?.errors) {
            const errorDetails = error.response.data.errors;
            const firstErrorKey = Object.keys(errorDetails)[0];
            alert(`Error: ${errorDetails[firstErrorKey][0]}`);
        } else {
            alert("Error: Verifica que tu contraseña actual sea correcta.");
        }
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}><ArrowLeftIcon /></button>
      </div>
      <div style={styles.content}>
        <h1 style={styles.title}>Configura tu contraseña</h1>
        <p style={styles.subtitle}>Por seguridad, ingresa tu contraseña actual y define una nueva.</p>
        <div style={styles.formContainer}>
          {/* Input Actual */}
          <div style={styles.inputGroup}>
            <div style={styles.inputIconLeft}><LockIcon /></div>
            <input type={showCurrent ? "text" : "password"} placeholder="Contraseña actual" style={styles.input} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}/>
            <button onClick={() => setShowCurrent(!showCurrent)} style={styles.inputIconRight}>{showCurrent ? <EyeOffIcon /> : <EyeIcon />}</button>
          </div>
          {/* Input Nueva */}
          <div style={styles.inputGroup}>
            <div style={styles.inputIconLeft}><LockIcon /></div>
            <input type={showNew ? "text" : "password"} placeholder="Nueva contraseña" style={styles.input} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
            <button onClick={() => setShowNew(!showNew)} style={styles.inputIconRight}>{showNew ? <EyeOffIcon /> : <EyeIcon />}</button>
          </div>
          {/* Input Confirmar */}
          <div style={styles.inputGroup}>
            <div style={styles.inputIconLeft}><LockIcon /></div>
            <input type={showConfirm ? "text" : "password"} placeholder="Confirmar nueva contraseña" style={styles.input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
            <button onClick={() => setShowConfirm(!showConfirm)} style={styles.inputIconRight}>{showConfirm ? <EyeOffIcon /> : <EyeIcon />}</button>
          </div>
          
          {newPassword && confirmPassword && newPassword !== confirmPassword && (<p style={{color: 'red', fontSize: '12px', marginTop: '-10px'}}>Las contraseñas no coinciden</p>)}
          
          <button style={{...styles.submitButton, backgroundColor: isValid ? '#FA9623' : '#E0E0E0', color: isValid ? '#fff' : '#999', cursor: isValid ? 'pointer' : 'not-allowed'}} disabled={!isValid} onClick={handleSubmit}>Cambiar Contraseña</button>
        </div>
      </div>
    </div>
  );
};

// Estilos rápidos (Mismos que antes)
const styles: { [key: string]: React.CSSProperties } = {
  container: { backgroundColor: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, sans-serif' },
  header: { padding: '20px', display: 'flex', alignItems: 'center' },
  backButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '10px' },
  content: { flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '480px', width: '100%', margin: '0 auto', padding: '20px 30px', justifyContent: 'center', marginBottom: '100px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px', textAlign: 'center' },
  subtitle: { fontSize: '16px', color: '#666', textAlign: 'center', marginBottom: '40px' },
  formContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
  input: { width: '100%', padding: '18px 50px', borderRadius: '16px', border: '1px solid #F0F0F0', backgroundColor: '#FAFAFA', fontSize: '16px', outline: 'none', color: '#333' },
  inputIconLeft: { position: 'absolute', left: '18px', display: 'flex', pointerEvents: 'none' },
  inputIconRight: { position: 'absolute', right: '18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 },
  submitButton: { marginTop: '20px', padding: '18px', borderRadius: '16px', border: 'none', fontSize: '16px', fontWeight: '700', transition: 'all 0.3s ease', width: '100%' }
};