import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    role: string;
    email: string;
    avatarUrl: string;
  };
}

// Iconos internos
const CameraIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
);
const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const MoonIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);
const GlobeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);
const ChevronRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={styles.modal}>
        
        {/* Header Naranja con Avatar */}
        <div style={styles.header}>
            <div style={styles.avatarContainer}>
                <img src={user.avatarUrl} alt="Profile" style={styles.avatarImage} />
                <button style={styles.cameraButton}><CameraIcon /></button>
            </div>
            <div style={styles.userInfo}>
                <h3 style={styles.userName}>{user.name}</h3>
                <p style={styles.userRole}>{user.role}</p>
                <p style={styles.userEmail}>{user.email}</p>
            </div>
        </div>

        {/* Lista de Opciones */}
        <div style={styles.optionsList}>
            
            {/* OPCIÓN 1: CAMBIAR CONTRASEÑA (CON NAVEGACIÓN) */}
            <div 
                style={styles.optionItem} 
                onClick={() => {
                    onClose(); // Cerramos el modal primero
                    navigate('/change-password'); // Navegamos a la nueva página
                }}
            >
                <div style={styles.optionIcon}><LockIcon /></div>
                <div style={styles.optionContent}>
                    <span style={styles.optionTitle}>Cambiar contraseña</span>
                    <span style={styles.optionSubtitle}>Actualiza tu seguridad</span>
                </div>
                <ChevronRight />
            </div>

            <div style={styles.optionItem}>
                <div style={styles.optionIcon}><MoonIcon /></div>
                <div style={styles.optionContent}>
                    <span style={styles.optionTitle}>Aspecto</span>
                    <span style={styles.optionSubtitle}>Modo claro</span>
                </div>
                <span style={styles.badge}>Próximamente</span>
            </div>

            <div style={{ ...styles.optionItem, borderBottom: 'none' }}>
                <div style={styles.optionIcon}><GlobeIcon /></div>
                <div style={styles.optionContent}>
                    <span style={styles.optionTitle}>Idioma</span>
                    <span style={styles.optionSubtitle}>Español</span>
                </div>
                <span style={styles.badge}>Próximamente</span>
            </div>

        </div>
      </div>
    </>
  );
};

// Estilos del Modal (Mismos que la imagen que enviaste)
const styles: { [key: string]: React.CSSProperties | any } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 998,
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    borderRadius: '24px',
    width: '400px',
    maxWidth: '90%',
    zIndex: 999,
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  header: {
    backgroundColor: '#FF9F43', // Color naranja principal
    padding: '30px 20px',
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: '20px',
  },
  avatarImage: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.5)',
    objectFit: 'cover'
  },
  cameraButton: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  userInfo: {
      display: 'flex',
      flexDirection: 'column',
  },
  userName: {
      margin: 0,
      fontSize: '20px',
      fontWeight: '700',
  },
  userRole: {
      margin: '2px 0',
      fontSize: '14px',
      opacity: 0.9,
  },
  userEmail: {
      margin: 0,
      fontSize: '12px',
      opacity: 0.8,
  },
  optionsList: {
      padding: '10px 0',
  },
  optionItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px 24px',
      cursor: 'pointer',
      borderBottom: '1px solid #f0f0f0',
      transition: 'background 0.2s',
  },
  optionIcon: {
      marginRight: '16px',
      display: 'flex',
  },
  optionContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
  },
  optionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333',
  },
  optionSubtitle: {
      fontSize: '12px',
      color: '#999',
  },
  badge: {
      backgroundColor: '#FFF0DE',
      color: '#FF9F43',
      fontSize: '10px',
      padding: '4px 8px',
      borderRadius: '10px',
      fontWeight: '700',
  }
};