import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import PortalInicio from './pages/PortalInicio';
import HojaRespuestas from './components/HojaRespuestas';
import ReporteResultado from './components/ReporteResultado';
import AdminPanel from './components/AdminPanel';
import { calificarEnsayo } from './lib/ensayoService';

// Componente Wrapper para el Ensayo
function EnsayoFlujo() {
  const [ultimoIntento, setUltimoIntento] = useState(null);
  const navigate = useNavigate();
  const { ensayoId } = useParams();

  const handleFinalizar = (datosAlumno) => {
    // Pasar ensayoId que viene de la URL (diagnostico o ensayo_3)
    const id = ensayoId === 'diagnostico' ? 'ensayo_diagnostico_2026' : ensayoId;
    const intento = calificarEnsayo({ ...datosAlumno, ensayoId: id });
    setUltimoIntento(intento);
  };

  if (ultimoIntento) {
    return (
      <ReporteResultado 
        intento={ultimoIntento} 
        onReiniciar={() => setUltimoIntento(null)} 
        onVolver={() => navigate('/')} 
      />
    );
  }

  // Mapeo simple para obtener el id real o fallback
  const idReal = ensayoId === 'diagnostico' ? 'ensayo_diagnostico_2026' : ensayoId;

  return (
    <HojaRespuestas 
      ensayoId={idReal}
      onFinalizar={handleFinalizar} 
      onVolver={() => navigate('/')} 
    />
  );
}

// Wrapper para Admin
function AdminFlujo() {
  const navigate = useNavigate();
  return <AdminPanel onVolver={() => navigate('/')} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortalInicio />} />
        <Route path="/ensayo/:ensayoId" element={<EnsayoFlujo />} />
        <Route path="/admin" element={<AdminFlujo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
