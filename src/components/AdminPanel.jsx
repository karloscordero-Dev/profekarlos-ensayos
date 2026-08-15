import React, { useState, useEffect, useMemo } from 'react';
import { Lock, Users, Award, Search, Eye, ArrowLeft, RefreshCw, Trash2, BarChart3, ChevronDown } from 'lucide-react';
import { ADMIN_PIN, obtenerTodosLosIntentos, eliminarIntento } from '../lib/ensayoService';
import ReporteResultado from './ReporteResultado';

export default function AdminPanel({ onVolver }) {
  const [autenticado, setAutenticado] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  
  const [intentos, setIntentos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [intentoSeleccionado, setIntentoSeleccionado] = useState(null);
  
  const [ensayoActivo, setEnsayoActivo] = useState('');

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('profekarlos_admin_auth');
    if (savedAuth === 'true') {
      setAutenticado(true);
      cargarDatos();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setAutenticado(true);
      sessionStorage.setItem('profekarlos_admin_auth', 'true');
      setPinError(false);
      cargarDatos();
    } else {
      setPinError(true);
    }
  };

  const cargarDatos = async () => {
    setCargando(true);
    const data = await obtenerTodosLosIntentos();
    setIntentos(data);
    setCargando(false);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este resultado? Esta acción no se puede deshacer.')) {
      await eliminarIntento(id);
      cargarDatos();
    }
  };

  const ensayosDisponibles = useMemo(() => [...new Set(intentos.map(i => i.ensayoTitulo || 'Ensayo Sin Título'))], [intentos]);
  
  useEffect(() => {
    if (ensayosDisponibles.length > 0 && !ensayoActivo) {
      setEnsayoActivo(ensayosDisponibles[0]);
    }
  }, [ensayosDisponibles, ensayoActivo]);

  // Pantalla Detalle de Intento
  if (intentoSeleccionado) {
    return (
      <div className="space-y-4 bg-[#07090e] min-h-screen">
        <div className="bg-[#0c0f17] border-b border-[#1a1f2e] p-4 sticky top-0 z-30 flex items-center justify-between">
          <button
            onClick={() => setIntentoSeleccionado(null)}
            className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a la Lista de Alumnos
          </button>
          <span className="text-xs text-slate-400 font-mono">
            Viendo resultado de: <strong className="text-white">{intentoSeleccionado.nombreEstudiante}</strong>
          </span>
        </div>
        <ReporteResultado
          intento={intentoSeleccionado}
          onReiniciar={() => setIntentoSeleccionado(null)}
          onVolver={() => setIntentoSeleccionado(null)}
        />
      </div>
    );
  }

  // Pantalla de Login
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4 selection:bg-emerald-500/30">
        <div className="bg-[#0f131d] border border-[#1e2538] rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-white font-serif">Panel Profe Karlos</h1>
            <p className="text-xs text-slate-400">
              Ingresa la clave de acceso de administrador para ver el reporte general de estudiantes.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Clave de Acceso
              </label>
              <input
                type="password"
                placeholder="Ingresa la clave..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full bg-[#151926] border border-[#222838] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                required
              />
              {pinError && (
                <p className="text-xs text-rose-400 mt-2 font-medium">Clave incorrecta. Intenta nuevamente.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              Ingresar al Panel
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={onVolver}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Volver a la página principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtrar los intentos por el ensayo activo seleccionado
  const intentosDelEnsayo = intentos.filter(i => (i.ensayoTitulo || 'Ensayo Sin Título') === ensayoActivo);
  
  // Buscar dentro del ensayo activo
  const intentosFiltrados = intentosDelEnsayo.filter(
    (i) =>
      i.nombreEstudiante.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.emailEstudiante.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Cálculos para el Ensayo Activo
  const totalIntentosActivo = intentosDelEnsayo.length;
  const promedioPuntajeActivo = totalIntentosActivo > 0
    ? Math.round(intentosDelEnsayo.reduce((acc, curr) => acc + (curr.puntajePaes || 100), 0) / totalIntentosActivo)
    : 0;

  // Habilidades del Ensayo Activo
  const habilidadesAcum = {};
  intentosDelEnsayo.forEach((i) => {
    if (i.habilidadesResumen) {
      Object.keys(i.habilidadesResumen).forEach((h) => {
        if (!habilidadesAcum[h]) habilidadesAcum[h] = { ok: 0, tot: 0 };
        habilidadesAcum[h].ok += i.habilidadesResumen[h].correctas || 0;
        habilidadesAcum[h].tot += i.habilidadesResumen[h].total || 0;
      });
    }
  });

  const habilidadesPromedio = Object.keys(habilidadesAcum).map(h => {
     const tot = habilidadesAcum[h].tot;
     const pct = tot > 0 ? Math.round((habilidadesAcum[h].ok / tot) * 100) : 0;
     return { nombre: h, porcentaje: pct, correctas: habilidadesAcum[h].ok, total: tot };
  }).sort((a, b) => b.porcentaje - a.porcentaje);

  const getBarColor = (pct) => {
    if (pct >= 75) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-amber-400';
    return 'bg-rose-500';
  };
  
  const getTextColor = (pct) => {
    if (pct >= 75) return 'text-emerald-400';
    if (pct >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1a1f2e] pb-6">
          <div>
            <button
              onClick={onVolver}
              className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors mb-2 gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Inicio
            </button>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Panel de Administración - Profe Karlos
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Resultados en tiempo real de ensayos de Competencia Lectora rindiéndose por estudiantes.
            </p>
          </div>

          <button
            onClick={cargarDatos}
            className="inline-flex items-center gap-2 bg-[#0f131d] hover:bg-[#161c2b] text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-[#1e2538] transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} /> Actualizar Datos
          </button>
        </div>

        {/* Selector de Ensayo y Resumen */}
        {ensayosDisponibles.length > 0 ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end justify-between">
              
              {/* Selector */}
              <div className="space-y-2 w-full sm:w-1/3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Selecciona el Ensayo a Revisar</label>
                <div className="relative">
                  <select 
                    value={ensayoActivo} 
                    onChange={(e) => setEnsayoActivo(e.target.value)}
                    className="w-full bg-[#121622] border border-[#1e2538] rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none font-semibold cursor-pointer shadow-lg"
                  >
                    {ensayosDisponibles.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Tarjeta de Promedio */}
              <div className="bg-[#121622] border border-[#1e2538] rounded-2xl p-4 flex items-center gap-4 shadow-xl w-full sm:w-auto px-8">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white font-mono">{promedioPuntajeActivo} <span className="text-sm font-normal text-slate-500">pts</span></div>
                  <div className="text-xs text-slate-400">Promedio Grupo ({totalIntentosActivo} rendidos)</div>
                </div>
              </div>

            </div>

            {/* Desglose de Habilidades del Grupo */}
            {habilidadesPromedio.length > 0 && (
              <div className="bg-[#0f131d] border border-[#1e2538] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#1e2538] pb-4">
                  <BarChart3 className="w-5 h-5 text-emerald-400" /> Desglose del Grupo por Habilidad
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {habilidadesPromedio.map((hab) => (
                    <div key={hab.nombre} className="bg-[#121622] border border-[#1e2538] rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white truncate pr-2" title={hab.nombre}>{hab.nombre}</span>
                        <span className={`text-sm font-mono font-bold ${getTextColor(hab.porcentaje)}`}>{hab.porcentaje}%</span>
                      </div>
                      <div className="w-full bg-[#181e2e] rounded-full h-2 overflow-hidden">
                        <div
                          className={`${getBarColor(hab.porcentaje)} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${hab.porcentaje}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 flex justify-between font-mono">
                        <span>Total Correctas Grupo: <strong>{hab.correctas}</strong> de {hab.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p>No se encontraron ensayos registrados todavía en la plataforma.</p>
          </div>
        )}

        {/* Search & Table */}
        {ensayosDisponibles.length > 0 && (
          <div className="bg-[#0f131d] border border-[#1e2538] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-white">Listado de Estudiantes</h2>
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Buscar alumno o correo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-[#151926] border border-[#222838] rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            {intentosFiltrados.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <p>No hay estudiantes que coincidan con la búsqueda en este ensayo.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e2538] text-slate-400 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 font-semibold">Estudiante</th>
                      <th className="py-3 px-4 font-semibold">Correo</th>
                      <th className="py-3 px-4 font-semibold">Fecha</th>
                      <th className="py-3 px-4 font-semibold">Buenas (de 60)</th>
                      <th className="py-3 px-4 font-semibold">Puntaje PAES</th>
                      <th className="py-3 px-4 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2538]">
                    {intentosFiltrados.map((item) => (
                      <tr key={item.id} className="hover:bg-[#151926]/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {item.nombreEstudiante}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono">
                          {item.emailEstudiante}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(item.fecha).toLocaleDateString('es-CL')}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-400 font-mono font-bold">
                          {item.correctas} / 60
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                          {item.puntajePaes} pts
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2 flex justify-end">
                          <button
                            onClick={() => setIntentoSeleccionado(item)}
                            className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold px-3 py-1.5 rounded-lg border border-emerald-500/30 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Ver Detalle
                          </button>
                          <button
                            onClick={() => handleEliminar(item.id)}
                            className="inline-flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold px-2 py-1.5 rounded-lg border border-rose-500/30 transition-colors"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
