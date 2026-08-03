import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, User, Mail, AlertCircle, ArrowLeft, Send, RotateCcw } from 'lucide-react';
import ensayoData from '../data/ensayoDiagnostico2026.json';

export default function HojaRespuestas({ onFinalizar, onVolver }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [respuestas, setRespuestas] = useState({});
  const [errorSubmit, setErrorSubmit] = useState('');
  const [confirmModal, setConfirmModal] = useState(false);

  const totalPreguntas = ensayoData.total_preguntas || 65;
  const respondidasCount = Object.keys(respuestas).length;

  // Cargar datos previos si existen en localStorage para comodidad
  useEffect(() => {
    const savedEmail = localStorage.getItem('profekarlos_user_email') || '';
    const savedNombre = localStorage.getItem('profekarlos_user_nombre') || '';
    const savedApellido = localStorage.getItem('profekarlos_user_apellido') || '';
    if (savedEmail) setEmail(savedEmail);
    if (savedNombre) setNombre(savedNombre);
    if (savedApellido) setApellido(savedApellido);
  }, []);

  const handleMarcar = (numeroPregunta, opcion) => {
    setRespuestas((prev) => {
      const copy = { ...prev };
      if (copy[numeroPregunta] === opcion) {
        // Desmarcar si hace clic en la misma
        delete copy[numeroPregunta];
      } else {
        copy[numeroPregunta] = opcion;
      }
      return copy;
    });
  };

  const handleOmitir = (numeroPregunta) => {
    setRespuestas((prev) => {
      const copy = { ...prev };
      delete copy[numeroPregunta];
      return copy;
    });
  };

  const validarYEnviar = (e) => {
    if (e) e.preventDefault();
    setErrorSubmit('');

    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      setErrorSubmit('Por favor completa tu Nombre, Apellido y Correo electrónico antes de enviar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorSubmit('Por favor ingresa un correo electrónico válido.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Guardar para futuros usos
    localStorage.setItem('profekarlos_user_email', email.trim());
    localStorage.setItem('profekarlos_user_nombre', nombre.trim());
    localStorage.setItem('profekarlos_user_apellido', apellido.trim());

    if (respondidasCount < totalPreguntas) {
      setConfirmModal(true);
    } else {
      ejecutarEnvio();
    }
  };

  const ejecutarEnvio = () => {
    onFinalizar({
      nombre,
      apellido,
      email,
      respuestas
    });
  };

  // Dividir las 65 preguntas en 3 columnas verticales balanceadas:
  // Columna 1: 1 a 22 (22 preguntas)
  // Columna 2: 23 a 44 (22 preguntas)
  // Columna 3: 45 a 65 (21 preguntas)
  const columnas = [
    { titulo: 'Bloque 1 (Preguntas 1 - 22)', preguntas: ensayoData.preguntas.slice(0, 22) },
    { titulo: 'Bloque 2 (Preguntas 23 - 44)', preguntas: ensayoData.preguntas.slice(22, 44) },
    { titulo: 'Bloque 3 (Preguntas 45 - 65)', preguntas: ensayoData.preguntas.slice(44, 65) }
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1a1f2e] pb-6">
          <div>
            <button
              onClick={onVolver}
              className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors mb-2 gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Inicio
            </button>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {ensayoData.titulo}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Marca tus alternativas de la A a la D. La evaluación contiene 65 preguntas en total.
            </p>
          </div>
          
          <div className="bg-[#0f131d] border border-[#1e2538] rounded-2xl px-5 py-3.5 flex sm:flex-col justify-between w-full sm:w-auto items-center sm:items-end shadow-lg">
            <span className="text-xs text-slate-400 font-medium">Progreso total</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                {respondidasCount}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ {totalPreguntas}</span>
            </div>
          </div>
        </div>

        {/* Mensaje de error si falta llenar algún dato */}
        {errorSubmit && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{errorSubmit}</span>
          </div>
        )}

        {/* Datos del Estudiante */}
        <div className="bg-[#0f131d] border border-[#1e2538] rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" /> Identificación del Estudiante
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombre *</label>
              <input
                type="text"
                placeholder=""
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-[#151926] border border-[#222838] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Apellido *</label>
              <input
                type="text"
                placeholder=""
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full bg-[#151926] border border-[#222838] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Correo Electrónico *</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="estudiante@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#151926] border border-[#222838] rounded-xl px-3.5 py-2.5 pl-9 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Matriz de Respuestas en Columnas Verticales */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Hoja de Respuestas Digital (1 a 65)
            </h2>
            <span className="text-xs text-slate-400">
              Haz clic en la opción elegida para marcar. Haz clic nuevamente para desmarcar.
            </span>
          </div>

          {/* Grid de 3 Columnas Verticales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {columnas.map((col, colIdx) => {
              const respondidasEnCol = col.preguntas.filter(p => respuestas[p.numero]).length;
              
              return (
                <div 
                  key={colIdx} 
                  className="bg-[#0f131d] border border-[#1e2538] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4"
                >
                  {/* Encabezado de Columna */}
                  <div className="flex items-center justify-between border-b border-[#1e2538] pb-3">
                    <span className="text-xs font-bold text-white tracking-wide">
                      {col.titulo}
                    </span>
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#181e2e] text-slate-400 border border-[#232b3f]">
                      {respondidasEnCol}/{col.preguntas.length}
                    </span>
                  </div>

                  {/* Lista Vertical de Preguntas */}
                  <div className="space-y-2.5">
                    {col.preguntas.map((p) => {
                      const qNum = p.numero;
                      const seleccion = respuestas[qNum];
                      const numFormatted = qNum < 10 ? `0${qNum}` : `${qNum}`;

                      return (
                        <div
                          key={qNum}
                          className={`flex items-center justify-between py-2 px-3 rounded-xl border transition-all ${
                            seleccion
                              ? 'bg-[#151d2c] border-emerald-500/40 shadow-sm shadow-emerald-500/5'
                              : 'bg-[#121622]/60 border-[#1c2233] hover:border-[#283149]'
                          }`}
                        >
                          {/* Número de Pregunta */}
                          <div className="flex items-center gap-2 min-w-[52px]">
                            <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg border ${
                              seleccion
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                                : 'bg-[#181d2a] text-slate-300 border-[#232b3d]'
                            }`}>
                              {numFormatted}
                            </span>
                          </div>

                          {/* Alternativas A, B, C, D */}
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            {['A', 'B', 'C', 'D'].map((opcion) => {
                              const isSelected = seleccion === opcion;
                              return (
                                <button
                                  key={opcion}
                                  type="button"
                                  onClick={() => handleMarcar(qNum, opcion)}
                                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-all flex items-center justify-center border ${
                                    isSelected
                                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30 scale-105 ring-2 ring-emerald-500/20'
                                      : 'bg-[#181d2a] text-slate-300 border-[#262f44] hover:bg-[#202738] hover:text-white hover:border-[#38435f]'
                                  }`}
                                >
                                  {opcion}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Submit Bar */}
        <div className="sticky bottom-4 bg-[#0a0d14]/95 border border-[#1e2538] backdrop-blur-md rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
          <div className="text-xs text-slate-300 text-center sm:text-left">
            <span className="font-semibold text-white">¿Listo para revisar?</span>
            <span className="text-slate-400 block sm:inline sm:ml-2">
              Se calculará tu Puntaje PAES y desglose por Habilidades inmediatamente.
            </span>
          </div>

          <button
            type="button"
            onClick={validarYEnviar}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-4 h-4" /> Finalizar y Ver Resultados
          </button>
        </div>
      </div>

      {/* Modal Confirmación si hay omitidas */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f131d] border border-[#1e2538] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" /> Tienes preguntas omitidas
            </h3>
            <p className="text-sm text-slate-300">
              Has respondido <strong className="text-emerald-400">{respondidasCount}</strong> de{' '}
              <strong className="text-white">{totalPreguntas}</strong> preguntas. ¿Deseas enviar el ensayo con{' '}
              <strong className="text-amber-400">{totalPreguntas - respondidasCount}</strong> preguntas omitidas?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-[#181e2e] transition-colors"
              >
                Volver a responder
              </button>
              <button
                onClick={() => {
                  setConfirmModal(false);
                  ejecutarEnvio();
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-colors"
              >
                Sí, entregar ensayo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
