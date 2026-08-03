import React, { useState, useEffect } from 'react';
import { Lock, Users, Award, AlertTriangle, Search, Eye, ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import { ADMIN_PIN, obtenerTodosLosIntentos, eliminarIntento } from '../lib/ensayoService';
import ReporteResultado from './ReporteResultado';

export default function AdminPanel({ onVolver }) {
  const [pinInput, setPinInput] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [intentos, setIntentos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [intentoSeleccionado, setIntentoSeleccionado] = useState(null);

  useEffect(() => {
    // Verificar si ya se autenticó previamente en la sesión
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

  // Cálculos globales para el reporte de curso
  const totalIntentos = intentos.length;
  const promedioPuntaje = totalIntentos > 0
    ? Math.round(intentos.reduce((acc, curr) => acc + (curr.puntajePaes || 100), 0) / totalIntentos)
    : 0;

  // Habilidad más débil del grupo
  const habilidadesAcum = { Localizar: { ok: 0, tot: 0 }, Interpretar: { ok: 0, tot: 0 }, Evaluar: { ok: 0, tot: 0 } };
  intentos.forEach((i) => {
    if (i.habilidadesResumen) {
      Object.keys(i.habilidadesResumen).forEach((h) => {
        if (!habilidadesAcum[h]) habilidadesAcum[h] = { ok: 0, tot: 0 };
        habilidadesAcum[h].ok += i.habilidadesResumen[h].correctas || 0;
        habilidadesAcum[h].tot += i.habilidadesResumen[h].total || 0;
      });
    }
  });

  let habilidadDebil = 'Ninguna';
  let minPct = 101;
  Object.keys(habilidadesAcum).forEach((h) => {
    const tot = habilidadesAcum[h].tot;
    if (tot > 0) {
      const pct = (habilidadesAcum[h].ok / tot) * 100;
      if (pct < minPct) {
        minPct = pct;
        habilidadDebil = h;
      }
    }
  });

  const intentosFiltrados = intentos.filter((i) => {
    const term = busqueda.toLowerCase();
    return (
      (i.nombreEstudiante || '').toLowerCase().includes(term) ||
      (i.emailEstudiante || '').toLowerCase().includes(term)
    );
  });

  // Modal para ver informe de un estudiante específico
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

  // Pantalla de Login si no está autenticado
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
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 font-medium text-center">
                Clave incorrecta. Inténtalo de nuevo.
              </p>
            )}

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

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0f131d] border border-[#1e2538] rounded-2xl p-5 flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{totalIntentos}</div>
              <div className="text-xs text-slate-400">Total Ensayos Rendidos</div>
            </div>
          </div>

          <div className="bg-[#0f131d] border border-[#1e2538] rounded-2xl p-5 flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{promedioPuntaje} <span className="text-xs font-normal text-slate-500">pts</span></div>
              <div className="text-xs text-slate-400">Promedio Puntaje PAES Curso</div>
            </div>
          </div>

          <div className="bg-[#0f131d] border border-[#1e2538] rounded-2xl p-5 flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{habilidadDebil}</div>
              <div className="text-xs text-slate-400">Habilidad Más Débil del Grupo</div>
            </div>
          </div>
        </div>

        {/* Search & Table */}
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
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>No se encontraron ensayos registrados todavía.</p>
              <p className="text-slate-500">Los resultados aparecerán aquí tan pronto los alumnos completen la hoja de respuestas.</p>
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
                      <td className="py-3.5 px-4 text-right space-x-2">
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
      </div>
    </div>
  );
}
