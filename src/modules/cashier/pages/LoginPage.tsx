import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoPng from '../../../assets/Logo_MesaLibreNuevo.png'; 
// 1. IMPORTAMOS AMBOS SERVICIOS
import { loginService, forgotPasswordService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

// --- Iconos SVG ---
const UserIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const LockIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>);
const EyeIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const EyeOffIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07-2.3 2.3"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>);

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false); // Estado de carga para el modal

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... (validaciones previas) ...

    try {
      const data = await loginService(email, password);
      
      if (data && data.accessToken) {
        // 1. Guardamos el Token (esto ya lo hacías)
        login(data.accessToken);

        // --- NUEVO: GUARDAR INFO DE USUARIO ---
        // Guardamos el objeto 'infoUsuario' que viene del back
        localStorage.setItem('userData', JSON.stringify(data.infoUsuario));
        // Guardamos el email que escribiste en el input (porque el back no lo devuelve en infoUsuario)
        localStorage.setItem('userEmail', email); 
        // --------------------------------------

        navigate('/tables');
      } else {
        setErrorMessage('Credenciales inválidas');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Error al iniciar sesión. Verifique sus datos.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE RECUPERACIÓN REAL ---
 const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus(null);
    setIsSendingEmail(true);

    try {
        // Llamada al servicio (ya corregido con 'email')
        await forgotPasswordService(forgotEmail);
        
        setForgotStatus({ 
            type: 'success', 
            msg: 'Si el correo existe, recibirás un enlace en breve.' 
        });
        
        // Cierre automático del modal
        setTimeout(() => {
            setShowForgotModal(false);
            setForgotStatus(null);
            setForgotEmail(""); 
        }, 3000);

    } catch (error) {
        console.error("Error recuperando:", error);
        setForgotStatus({ 
            type: 'error', 
            msg: 'Hubo un problema. Verifica que el correo esté bien escrito.' 
        });
    } finally {
        setIsSendingEmail(false);
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Branding */}
      <div style={styles.brandingSection}>
        <div style={styles.logoContainer}>
             <img src={logoPng} alt="Logo del Restaurante" style={styles.logoImage} />
        </div>
        <h2 style={styles.brandingText}>
          Sistema integral para la gestión de tu restaurante.
        </h2>
      </div>

      {/* Formulario Login */}
      <div style={styles.formSection}>
        <div style={styles.formWrapper}>
          <h2 style={styles.title}>Iniciar sesión</h2>

          {errorMessage && (
              <div style={styles.errorBanner}>
                  {errorMessage}
              </div>
          )}

          <form onSubmit={handleLogin} style={styles.form}>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Correo</label>
              <div style={styles.inputContainer}>
                <div style={styles.inputIconLeft}><UserIcon /></div>
                <input
                  type="email"
                  placeholder="Ingresa tu correo"
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña</label>
              <div style={styles.inputContainer}>
                <div style={styles.inputIconLeft}><LockIcon /></div>
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  style={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.inputIconRight}
                >
                  {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div style={styles.forgotContainer}>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={styles.forgotLink}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button 
                type="submit" 
                style={{
                    ...styles.loginButton,
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
                disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>

      {/* --- MODAL RECUPERAR CONTRASEÑA (CONECTADO) --- */}
      {showForgotModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Recuperar contraseña</h3>
            <p style={styles.modalText}>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                style={styles.modalInput}
                required
              />
              {forgotStatus && (
                <p style={{marginBottom: '15px', color: forgotStatus.type === 'success' ? 'green' : 'red', fontWeight: '600'}}>
                  {forgotStatus.msg}
                </p>
              )}
              <div style={styles.modalButtons}>
                <button 
                    type="button" 
                    onClick={() => setShowForgotModal(false)} 
                    style={styles.cancelButton}
                    disabled={isSendingEmail}
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    style={{
                        ...styles.sendButton,
                        opacity: isSendingEmail ? 0.7 : 1,
                        cursor: isSendingEmail ? 'not-allowed' : 'pointer'
                    }}
                    disabled={isSendingEmail}
                >
                    {isSendingEmail ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// --- Estilos ---
const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', minHeight: '100vh', width: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  brandingSection: { flex: 1, backgroundColor: '#FA9623', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', textAlign: 'center' },
  logoContainer: { marginBottom: '30px' },
  logoImage: { width: '600px', height: 'auto', objectFit: 'contain' },
  brandingText: { color: '#fff', fontSize: '24px', maxWidth: '400px', lineHeight: '1.4', fontWeight: '500' },
  formSection: { flex: 1, backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' },
  formWrapper: { width: '100%', maxWidth: '450px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#333', marginBottom: '40px' },
  errorBanner: { backgroundColor: '#FDECEA', color: '#D32F2F', padding: '10px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #F8B9B7', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column' },
  inputGroup: { marginBottom: '24px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '18px', fontWeight: '600', color: '#4B5563' },
  inputContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
  input: { width: '100%', height: '55px', padding: '0 50px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '16px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', backgroundColor: '#FFFFFF', color: '#000000' },
  inputIconLeft: { position: 'absolute', left: '15px', display: 'flex', pointerEvents: 'none' },
  inputIconRight: { position: 'absolute', right: '15px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' },
  forgotContainer: { display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' },
  forgotLink: { background: 'none', border: 'none', color: '#F97316', fontSize: '16px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' },
  loginButton: { width: '100%', height: '60px', backgroundColor: '#FF8108', color: '#fff', fontSize: '20px', fontWeight: '700', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
  modalTitle: { fontSize: '24px', fontWeight: '700', marginBottom: '16px', marginTop: 0, color: '#333' },
  modalText: { color: '#4B5563', marginBottom: '24px', lineHeight: '1.5' },
  modalInput: { width: '100%', height: '50px', padding: '0 15px', borderRadius: '8px', border: '1px solid #D1D5DB', marginBottom: '20px', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#000000' },
  modalButtons: { display: 'flex', gap: '15px' },
  cancelButton: { flex: 1, padding: '12px', backgroundColor: '#E5E7EB', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#1F2937' },
  sendButton: { flex: 1, padding: '12px', backgroundColor: '#FF8108', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#fff' }
};