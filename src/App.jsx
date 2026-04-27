import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import logoRCF from './assets/logoRCF.jpg';

const App = () => {
  const [userAddress, setUserAddress] = useState(localStorage.getItem('userAddress') || '');
  const [races, setRaces] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ton lien Google Sheet (CSV)
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT7VH4zr6IQ7agsL5OJNsZnuI1u_U1rwMqllWnxF8gbVh0JF71wJQqxDoD24EkBhdKijm6_XtyDML2W/pub?output=csv";

  // 1. Gestion de l'autocomplétion d'adresse
  const handleAddressChange = async (query) => {
    setUserAddress(query);
    if (query.length > 3) {
      try {
        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        setSuggestions(data.features);
      } catch (error) {
        console.error("Erreur API Adresse", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (label) => {
    setUserAddress(label);
    localStorage.setItem('userAddress', label);
    setSuggestions([]);
  };

  // 2. Chargement des données du club
  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      complete: (results) => {
        const cleanData = results.data.filter(row => row.name);
        setRaces(cleanData);
        setLoading(false);
      },
      error: (error) => {
        console.error("Erreur Google Sheet:", error);
        setLoading(false);
      }
    });
  }, []);

  // 3. Formatage de la date pour le carré calendrier
  const getCalDate = (dateStr) => {
    if (!dateStr) return { day: '?', month: '?' };
    const parts = dateStr.split('/');
    const d = parts.length === 3 
      ? new Date(parts[2], parts[1] - 1, parts[0]) 
      : new Date(dateStr);
    
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase().replace('.', '')
    };
  };

  return (
    <div>
      <header>
        <img src={logoRCF} alt="Logo RCF" style={{ width: '80px', marginBottom: '10px' }} />
        <h1>Racing Club <span style={{ color: 'var(--primary)' }}>Fagnières</span></h1>
        <p style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>
          Calendrier des événements du club
        </p>
      </header>

      <div className="container">
        {/* SECTION ADRESSE */}
        <div className="address-section" style={{ position: 'relative' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>📍 Mon point de départ :</label>
          <input 
            type="text" 
            placeholder="Tapez votre adresse pour le calcul..."
            value={userAddress}
            onChange={(e) => handleAddressChange(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((s, index) => (
                <li key={index} className="suggestion-item" onClick={() => selectSuggestion(s.properties.label)}>
                  {s.properties.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <h3 style={{ marginBottom: '20px' }}>Calendrier Officiel</h3>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Chargement des courses...</p>
        ) : (
          races.sort((a, b) => {
            const dateA = a.date.split('/').reverse().join('-');
            const dateB = b.date.split('/').reverse().join('-');
            return new Date(dateA) - new Date(dateB);
          }).map(race => {
            const cal = getCalDate(race.date);
            
            // Logique de détection "Événement Passé"
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const parts = race.date.split('/');
            const eventDate = parts.length === 3 
              ? new Date(parts[2], parts[1] - 1, parts[0]) 
              : new Date(race.date);
            const isPast = eventDate < today;

            return (
              <div 
                key={race.id} 
                className={`calendar-item ${isPast ? 'event-past' : ''}`} 
                onClick={() => setSelectedRace(race)}
              >
                <div className="calendar-date">
                  <span className="calendar-month">{cal.month}</span>
                  <span className="calendar-day">{cal.day}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="badge" style={{ 
                      background: isPast ? '#333' : (race.category === 'National' ? '#CC0000' : '#444'),
                      color: isPast ? '#888' : '#fff'
                    }}>
                      {isPast ? '✅ Terminé' : race.category}
                    </span>
                    <p className="race-details-sub">🕒 {race.time}</p>
                  </div>
                  
                  <h4 style={{ 
                    fontSize: '16px', 
                    margin: '5px 0', 
                    textDecoration: isPast ? 'line-through' : 'none',
                    color: isPast ? '#666' : '#fff' 
                  }}>
                    {race.name}
                  </h4>
                  
                  <span className="race-location" style={{ color: isPast ? '#555' : '#fff' }}>
                    📍 {race.location}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

{/* MODAL DE DÉTAILS */}
      {selectedRace && (() => {
        // Logique pour vérifier si la date est passée
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const parts = selectedRace.date.split('/');
        const eventDate = parts.length === 3 
          ? new Date(parts[2], parts[1] - 1, parts[0]) 
          : new Date(selectedRace.date);
        const isPast = eventDate < today;

        return (
          <div className="modal-overlay" onClick={() => setSelectedRace(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="btn-close" onClick={() => setSelectedRace(null)}>✕</button>
              
              {/* Message d'alerte si l'événement est passé */}
              {isPast && (
                <div style={{
                  background: '#222',
                  color: '#ff4444', // Rouge un peu plus sombre pour le passé
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: '900',
                  marginBottom: '15px',
                  border: '1px solid #333',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  🏁 Événement terminé
                </div>
              )}

              <h2 style={{ 
                margin: '0 0 10px 0', 
                textDecoration: isPast ? 'line-through' : 'none',
                opacity: isPast ? 0.5 : 1,
                fontSize: '20px'
              }}>
                {selectedRace.name}
              </h2>
              
              <p style={{ 
                color: isPast ? '#666' : 'var(--primary)', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {selectedRace.date}
              </p>

              <div className="modal-destination-block" style={{ 
                opacity: isPast ? 0.4 : 1,
                border: isPast ? '1px dashed #444' : '1px solid #333'
              }}>
                <p className="modal-destination-label">DESTINATION</p>
                <p className="modal-destination-value">{selectedRace.location}</p>
              </div>

              {/* Grise les boutons si c'est passé */}
              <div className="grid-btns" style={{ 
                filter: isPast ? 'grayscale(1) opacity(0.5)' : 'none',
                pointerEvents: isPast ? 'none' : 'auto' // Optionnel : désactive les clics si passé
              }}>
                <a className="nav-link" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(userAddress)}&destination=${encodeURIComponent(selectedRace.location)}`}>🗺️ Trajet</a>
                <a className="nav-link" target="_blank" rel="noreferrer" href={`https://waze.com/ul?q=${encodeURIComponent(selectedRace.location)}&navigate=yes`}>🚙 Waze</a>
                <a className="nav-link" target="_blank" rel="noreferrer" href={`https://www.airbnb.fr/s/${encodeURIComponent(selectedRace.location)}/homes`}>🏠 Dodo</a>
              </div>
              
              <button 
                onClick={() => setSelectedRace(null)} 
                style={{ 
                  width: '100%', 
                  padding: '15px', 
                  background: isPast ? '#333' : 'var(--primary)', 
                  color: isPast ? '#888' : 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  marginTop: '15px',
                  textTransform: 'uppercase'
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default App;