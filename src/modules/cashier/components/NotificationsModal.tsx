import React from 'react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Iconos internos
const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const BellIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9F43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        
        {/* Header */}
        <div style={styles.header}>
            <div style={styles.titleContainer}>
                <div style={styles.iconCircle}>
                    <BellIcon />
                </div>
                <h2 style={styles.title}>Notificaciones</h2>
            </div>
            <button onClick={onClose} style={styles.closeIconButton}>
                <CloseIcon />
            </button>
        </div>

        {/* Cuerpo del Modal (Empty State) */}
        <div style={styles.body}>
            <p style={styles.emptyText}>No hay notificaciones por el momento</p>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
            <button onClick={onClose} style={styles.closeButton}>
                Cerrar
            </button>
        </div>

      </div>
    </div>
  );
};

// Estilos visuales
const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1200, // Alto z-index para estar encima de todo
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    width: '450px',
    maxWidth: '90%',
    padding: '30px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
    display: 'flex', flexDirection: 'column',
    minHeight: '400px', // Altura mínima para que se vea como en la imagen
    justifyContent: 'space-between'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '20px',
  },
  titleContainer: {
      display: 'flex', alignItems: 'center', gap: '15px'
  },
  iconCircle: {
      width: '45px', height: '45px', borderRadius: '50%',
      backgroundColor: '#FFF0DE', // Naranja muy claro
      display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  title: {
    margin: 0, fontSize: '20px', fontWeight: '700', color: '#333',
  },
  closeIconButton: {
    background: 'none', border: 'none', cursor: 'pointer', padding: '5px',
  },
  body: {
    flex: 1,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '18px', color: '#999', fontWeight: '500'
  },
  footer: {
    marginTop: '20px',
  },
  closeButton: {
    width: '100%', padding: '15px',
    backgroundColor: '#FF9F43', color: '#fff',
    border: 'none', borderRadius: '12px',
    fontSize: '16px', fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 159, 67, 0.3)',
    transition: 'background 0.2s'
  }
};