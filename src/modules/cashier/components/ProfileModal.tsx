import React, { useRef, useState,type ChangeEvent } from 'react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        name: string;
        role: string;
        email: string;
        avatarUrl: string;
    };
    onAvatarUpdate: (newUrl: string) => void; 
}

// Iconos
const CloseIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const CameraIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9F43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const MailIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9F43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);
const BadgeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9F43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/></svg>);

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onAvatarUpdate }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    // --- GUARDADO PERSISTENTE ---
    const handleSaveAvatar = () => {
        if (!selectedFile) return;

        setIsUploading(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            
            // 1. Guardamos la imagen asociada AL CORREO DEL USUARIO
            // Esto evita que se borre o se mezcle si entra otro usuario
            if (user.email) {
                const storageKey = `avatar_${user.email}`; 
                localStorage.setItem(storageKey, base64String);
                console.log(`Foto guardada localmente para: ${storageKey}`);
            }

            // 2. Actualizamos la app en caliente
            onAvatarUpdate(base64String);

            setTimeout(() => {
                alert("✅ Foto de perfil actualizada (Persistente).");
                setIsUploading(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                onClose();
            }, 500);
        };

        reader.readAsDataURL(selectedFile);
    };

    // Preferimos la preview, si no, la del usuario
    const currentAvatarToDisplay = previewUrl || user.avatarUrl;

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                />
                <div style={styles.modalHeader}>
                    <h2 style={styles.modalTitle}>Mi Perfil</h2>
                    <button style={styles.closeButton} onClick={onClose}><CloseIcon /></button>
                </div>
                <div style={styles.modalBody}>
                    <div style={styles.avatarSection}>
                        <div style={styles.avatarWrapper} onClick={handleImageClick}>
                            <img src={currentAvatarToDisplay} alt="Profile" style={styles.avatarImage} />
                            <div style={styles.avatarOverlay}>
                                <CameraIcon />
                                <span style={{fontSize: '12px', color: 'white', marginTop: '4px'}}>Cambiar</span>
                            </div>
                        </div>
                        {previewUrl && !isUploading && (
                            <p style={{color: '#FF9F43', fontSize: '14px', marginTop: '10px'}}>¡Foto lista para guardar!</p>
                        )}
                    </div>
                    <div style={styles.detailsSection}>
                        <div style={styles.detailItem}>
                            <div style={styles.iconWrapper}><UserIcon /></div>
                            <div>
                                <p style={styles.detailLabel}>Nombre Completo</p>
                                <p style={styles.detailValue}>{user.name}</p>
                            </div>
                        </div>
                        <div style={styles.detailItem}>
                             <div style={styles.iconWrapper}><BadgeIcon /></div>
                             <div>
                                <p style={styles.detailLabel}>Rol</p>
                                <p style={styles.detailValue}>{user.role}</p>
                            </div>
                        </div>
                        <div style={styles.detailItem}>
                            <div style={styles.iconWrapper}><MailIcon /></div>
                            <div>
                                <p style={styles.detailLabel}>Correo Electrónico</p>
                                <p style={styles.detailValue}>{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {previewUrl && (
                    <div style={styles.modalFooter}>
                        <button 
                            style={styles.saveButton} 
                            onClick={handleSaveAvatar}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Guardando...' : 'Guardar Nueva Foto'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 },
    modalContent: { backgroundColor: '#fff', borderRadius: '20px', padding: '30px', width: '450px', maxWidth: '90%', boxShadow: '0 15px 40px rgba(0,0,0,0.15)', animation: 'fadeIn 0.3s ease' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    modalTitle: { margin: 0, fontSize: '24px', fontWeight: '700', color: '#333' },
    closeButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px' },
    modalBody: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    avatarSection: { marginBottom: '30px', textAlign: 'center' },
    avatarWrapper: { position: 'relative', width: '120px', height: '120px', borderRadius: '50%', cursor: 'pointer', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', border: '4px solid #fff' },
    avatarImage: { width: '100%', height: '100%', objectFit: 'cover' },
    avatarOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transition: 'opacity 0.3s ease' },
    detailsSection: { width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' },
    detailItem: { display: 'flex', alignItems: 'center', backgroundColor: '#F8F9FA', padding: '15px 20px', borderRadius: '12px' },
    iconWrapper: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFF5EB', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '15px' },
    detailLabel: { margin: '0 0 5px 0', fontSize: '13px', color: '#999', fontWeight: '600', textTransform: 'uppercase' },
    detailValue: { margin: 0, fontSize: '16px', color: '#333', fontWeight: '600' },
    modalFooter: { marginTop: '25px', display: 'flex', justifyContent: 'center', width: '100%' },
    saveButton: { padding: '12px 30px', borderRadius: '12px', border: 'none', backgroundColor: '#FF9F43', color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 159, 67, 0.3)', transition: 'background-color 0.2s', width: '100%' }
};