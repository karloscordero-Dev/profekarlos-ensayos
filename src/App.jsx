import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import PortalInicio from './pages/PortalInicio';
import HojaRespuestas from './components/HojaRespuestas';
import ReporteResultado from './components/ReporteResultado';
import AdminPanel from './components/AdminPanel';
import { calificarEnsayo } from './lib/ensayoService';

// Componente Wrapper para el Ensayo
function EnsayoFlujo() {
  const [ultimoIntento, setUltimoIntento] = useState(null);
  const navigate = useNavigate();

  const handleFinalizar = (datosAlumno) => {
    const intento = calificarEnsayo(datosAlumno);
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

  return (
    <HojaRespuestas 
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
        <Route path="/ensayo/diagnostico" element={<EnsayoFlujo />} />
        <Route path="/admin" element={<AdminFlujo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
