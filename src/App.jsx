import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import logoRCF from './assets/logoRCF.jpg';
import InstallGuide from './InstallGuide'; // Assure-toi que le fichier InstallGuide.js est dans le même dossier
const App = () => {
 const [races, setRaces] = useState([]);
 const [selectedRace, setSelectedRace] = useState(null);
 const [loading, setLoading] = useState(true);
 const [showPast, setShowPast] = useState(false);
 const [filterCategory, setFilterCategory] = useState('Tous');
 // URL de ton Google Sheets
 const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT7VH4zr6IQ7agsL5OJNsZnuI1u_U1rwMqllWnxF8gbVh0JF71wJQqxDoD24EkBhdKijm6_XtyDML2W/pub?output=csv";
 // FONCTION UNIQUE POUR LES COULEURS
 const getCategoryColor = (categoryName) => {
   const cat = categoryName?.toLowerCase() || '';
   if (cat.includes('internationnal')) return '#8b5cf6'; // Violet
   if (cat.includes('national'))      return '#ef4444'; // Rouge
   if (cat.includes('régional'))      return '#3b82f6'; // Bleu
   if (cat.includes('départemental')) return '#10b981'; // Vert
   return '#64748b'; // Gris par défaut
 };
 useEffect(() => {
   Papa.parse(SHEET_URL, {
     download: true, header: true, skipEmptyLines: true,
     complete: (results) => {
       const normalizedData = results.data.map(row => {
         const newRow = {};
         // On normalise les clés du CSV (minuscules et sans espaces)
         Object.keys(row).forEach(key => { newRow[key.toLowerCase().trim()] = row[key]; });
         return newRow;
       }).filter(row => row.name && row.date);
       setRaces(normalizedData);
       setLoading(false);
     }
   });
 }, []);
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 // Filtrage et tri
 const filteredRaces = races.filter(race => {
   const matchCat = filterCategory === 'Tous' || race.category === filterCategory;
   const raceDate = new Date(race.date);
   return showPast ? matchCat : (raceDate >= today && matchCat);
 }).sort((a, b) => new Date(a.date) - new Date(b.date));
 const categories = ['Tous', ...new Set(races.map(r => r.category))];
 return (
<div className="m-app">
     {/* ON AJOUTE LE GUIDE ICI */}
<InstallGuide />
<header className="m-header">
<img src={logoRCF} alt="RCF" className="m-logo-img" />
<h1>RCF <span className="m-red">Fagnières</span></h1>
</header>
<div className="m-content">
<div className="m-filter-row">
<select onChange={(e) => setFilterCategory(e.target.value)} className="m-select-ui">
           {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
</select>
<button onClick={() => setShowPast(!showPast)} className={`m-btn-ui ${showPast ? 'active' : ''}`}>
           {showPast ? "Archives" : "À venir"}
</button>
</div>
       {loading ? <div className="m-loader">Chargement...</div> : (
         filteredRaces.map((race, index) => (
<div key={index} className="m-event-card" onClick={() => setSelectedRace(race)} style={{ borderLeft: `6px solid ${getCategoryColor(race.category)}` }}>
<div className="m-event-date">
  <span className="m-event-day">{new Date(race.date).getDate()}</span>
  <span className="m-event-month" style={{ color: getCategoryColor(race.category) }}>
    {new Date(race.date).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
  </span>
  {/* AJOUT DE L'ANNÉE CI-DESSOUS */}
  <span className="m-event-year" style={{ 
    fontSize: '10px', 
    opacity: 0.6, 
    fontWeight: 'bold',
    marginTop: '-2px' 
  }}>
    {new Date(race.date).getFullYear()}
  </span>
</div>
<div className="m-event-info">
<span className="m-event-tag" style={{ background: getCategoryColor(race.category) }}>{race.category}</span>
<h4>{race.name}</h4>
<p>📍 {race.location}</p>
</div>
</div>
         ))
       )}
</div>
     {selectedRace && (
<div className="m-modal-backdrop" onClick={() => setSelectedRace(null)}>
<div className="m-modal-drawer" onClick={e => e.stopPropagation()}>
<div className="m-modal-bar"></div>
<h3>{selectedRace.name}</h3>
<p className="m-modal-sub">
               {new Date(selectedRace.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
</p>
           {selectedRace.information && (
<div className="m-modal-description">
<strong>Information :</strong> {selectedRace.information}
</div>
           )}
<div className="m-modal-map">
<iframe title="map" width="100%" height="180" style={{border:0}} src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedRace.location)}&output=embed`}></iframe>
</div>
<div className="m-modal-grid">
<a href={`https://maps.google.com/maps?q=${encodeURIComponent(selectedRace.location)}`} target="_blank" rel="noreferrer" className="m-action-btn maps">Maps</a>
<a href={`https://waze.com/ul?q=piste+bmx+${encodeURIComponent(selectedRace.location)}&navigate=yes`} target="_blank" rel="noreferrer" className="m-action-btn waze">Waze</a>
<a href={`https://www.airbnb.fr/s/${encodeURIComponent(selectedRace.location)}/homes`} target="_blank" rel="noreferrer" className="m-action-btn dodo">Dodo</a>
</div>
<button className="m-btn-close" onClick={() => setSelectedRace(null)}>Fermer</button>
</div>
</div>
     )}
</div>
 );
};
export default App;