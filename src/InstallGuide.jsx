import React, { useState, useEffect } from 'react';

const InstallGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Détection si l'app est déjà installée
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isPWA) setIsInstalled(true);
  }, []);

  if (isInstalled) return null;

  // Construction du chemin de l'image de manière dynamique
  // Cela évite les erreurs de chargement selon l'hébergeur
  const guideImgPath = `${import.meta.env.BASE_URL}guide-rcf.png`;

  return (
    <>
      {/* Bouton "i" positionné intelligemment */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top) + 25px)',
          right: 'calc(50% - 230px)', 
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          backgroundColor: '#1e293b',
          color: 'white',
          border: '1px solid #334155',
          fontSize: '16px',
          fontWeight: '900',
          cursor: 'pointer',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
        }}
        className="m-btn-i"
      >
        i
      </button>

      {/* Modal Guide d'installation */}
      {isOpen && (
        <div className="m-modal-backdrop" onClick={() => setIsOpen(false)}>
          <div className="m-modal-drawer" onClick={e => e.stopPropagation()}>
            <div className="m-modal-bar"></div>
            
            <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#0f172a' }}>
              Installer l'application
            </h3>
            <p className="m-modal-sub">RCF BMX Fagnières</p>

            <div className="m-modal-description">
              {/* Affichage de l'image guide depuis le dossier public */}
              <img 
                src={guideImgPath} 
                alt="Guide installation" 
                style={{ 
                  width: '100%', 
                  borderRadius: '10px', 
                  marginBottom: '15px',
                  display: 'block',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onError={(e) => {
                  // Si l'image échoue, on affiche un petit message discret
                  e.target.style.display = 'none';
                  console.error("L'image guide-rcf.png est introuvable dans le dossier public");
                }}
              />
              
              <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
                Pour accéder rapidement au calendrier, ajoutez l'application à votre écran d'accueil :
                <br /><br />
                <strong>Sur iPhone :</strong> Partager {'>'} "Sur l'écran d'accueil"
                <br />
                <strong>Sur Android :</strong> Menu ⋮ {'>'} "Installer l'application"
              </p>
            </div>

            <button className="m-btn-close" onClick={() => setIsOpen(false)}>
              J'ai compris
            </button>
          </div>
        </div>
      )}

      {/* Ajustement pour mobile uniquement */}
      <style>{`
        @media (max-width: 540px) {
          .m-btn-i {
            right: 15px !important;
          }
        }
      `}</style>
    </>
  );
};

export default InstallGuide;