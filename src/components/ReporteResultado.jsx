import React, { useState } from 'react';
import { Award, CheckCircle, XCircle, MinusCircle, HelpCircle, ArrowLeft, RefreshCw, Printer, BookOpen, User, Mail, Calendar } from 'lucide-react';

export default function ReporteResultado({ intento, onReiniciar, onVolver }) {
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'errores', 'piloto'

  if (!intento) return null;

  const {
    nombreEstudiante,
    emailEstudiante,
    fecha,
    puntajePaes,
    correctas,
    incorrectas,
    omitidas,
    habilidadesResumen,
    desglosePreguntas
  } = intento;

  const preguntasFiltradas = desglosePreguntas.filter((p) => {
    if (filtro === 'errores') return p.esCorrecta === false;
    if (filtro === 'piloto') return p.esPiloto === true;
    return true;
  });

  const getPuntajeMensaje = (pts) => {
    if (pts >= 850) return '¡Nivel Sobresaliente! Estás en rango de puntaje nacional en Competencia Lectora.';
    if (pts >= 750) return '¡Excelente desempeño! Tienes un dominio sólido de las habilidades PAES.';
    if (pts >= 600) return '¡Buen resultado! Tienes buena base, reforzando las áreas débiles subirás aún más.';
    return '¡Sigue practicando! Revisa el desglose por habilidades para enfocar tu estudio.';
  };

  const handleImprimir = () => {
    // Si hay un filtro aplicado que oculta preguntas, restablecer para que el reporte impreso esté completo
    if (filtro !== 'todos') {
      setFiltro('todos');
    }
    // Timeout para permitir que el navegador actualice el estado antes de llamar al diálogo de impresión
    setTimeout(() => {
      window.print();
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500/30 print:bg-white print:text-slate-900 print:py-2 print:px-2">
      <div className="max-w-4xl mx-auto space-y-8 print:py-0 print:space-y-4 print:max-w-none">
        
        {/* Navigation Top */}
        <div className="flex items-center justify-between print:hidden">
          <button
            onClick={onVolver}
            className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#121622]"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleImprimir}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f131d] hover:bg-[#161c2b] text-slate-200 text-xs font-medium border border-[#1e2538] transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir / Guardar PDF
            </button>
            <button
              onClick={onReiniciar}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30 transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Rendir de Nuevo
            </button>
          </div>
        </div>

        {/* Header Reporte */}
        <div className="bg-[#0f131d] border border-[#1e2538] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e2538] pb-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
                Informe Oficial de Resultados
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {intento.ensayoTitulo || 'Ensayo PAES Competencia Lectora'}
              </h1>
            </div>
            <div className="text-xs text-slate-400 space-y-1 sm:text-right">
              <div className="flex items-center sm:justify-end gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <strong className="text-slate-200">{nombreEstudiante}</strong>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5 font-mono text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{emailEstudiante}</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(fecha).toLocaleDateString('es-CL')}</span>
              </div>
            </div>
          </div>

          {/* Puntaje Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1 bg-[#121622] border border-[#1e2538] rounded-2xl p-6 text-center space-y-2 relative overflow-hidden shadow-inner">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Puntaje Estimado PAES
              </div>
              <div className="text-5xl sm:text-6xl font-serif font-extrabold text-white tracking-tight">
                {puntajePaes}
              </div>
              <div className="text-xs font-medium text-emerald-400 font-mono">
                Escala DEMRE 100 - 1000 pts
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="bg-[#121622] border border-[#1e2538] rounded-2xl p-4">
                <p className="text-sm text-slate-300 font-medium">
                  {getPuntajeMensaje(puntajePaes)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#121622] border border-[#1e2538] rounded-xl p-3 text-center">
                  <div className="text-xs text-slate-400 mb-0.5">Correctas</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono">{correctas} <span className="text-xs text-slate-500">/60</span></div>
                </div>
                <div className="bg-[#121622] border border-[#1e2538] rounded-xl p-3 text-center">
                  <div className="text-xs text-slate-400 mb-0.5">Incorrectas</div>
                  <div className="text-xl font-bold text-rose-400 font-mono">{incorrectas}</div>
                </div>
                <div className="bg-[#121622] border border-[#1e2538] rounded-xl p-3 text-center">
                  <div className="text-xs text-slate-400 mb-0.5">Omitidas</div>
                  <div className="text-xl font-bold text-amber-400 font-mono">{omitidas}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rendimiento por Habilidades */}
        {habilidadesResumen && Object.keys(habilidadesResumen).length > 0 && (
          <div className="bg-[#0f131d] border border-[#1e2538] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" /> Desempeño por Habilidades PAES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(habilidadesResumen).map(([hab, stat]) => (
                <div key={hab} className="bg-[#121622] border border-[#1e2538] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{hab}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{stat.porcentaje}%</span>
                  </div>
                  <div className="w-full bg-[#181e2e] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stat.porcentaje}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between font-mono">
                    <span>Correctas: <strong>{stat.correctas}</strong> de {stat.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solucionario y Desglose de Preguntas */}
        <div className="bg-[#0f131d] border border-[#1e2538] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" /> Solucionario Pregunta por Pregunta
            </h2>
            <div className="flex gap-1.5 bg-[#121622] p-1 rounded-xl border border-[#1e2538] text-xs">
              <button
                onClick={() => setFiltro('todos')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filtro === 'todos' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas ({desglosePreguntas.length})
              </button>
              <button
                onClick={() => setFiltro('errores')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filtro === 'errores' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Errores ({incorrectas})
              </button>
              <button
                onClick={() => setFiltro('piloto')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filtro === 'piloto' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Piloto (5)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {preguntasFiltradas.map((p) => {
              const esPiloto = p.esPiloto;
              const esCorrecta = p.esCorrecta;
              const omitida = !p.opcionElegida;

              let cardStyle = 'border-[#1e2538] bg-[#121622]';
              let icon = <HelpCircle className="w-4 h-4 text-slate-500" />;

              if (esPiloto) {
                cardStyle = 'border-slate-700/40 bg-slate-800/20';
                icon = <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">PILOTO</span>;
              } else if (esCorrecta) {
                cardStyle = 'border-emerald-500/30 bg-emerald-950/20';
                icon = <CheckCircle className="w-4 h-4 text-emerald-400" />;
              } else if (omitida) {
                cardStyle = 'border-amber-500/30 bg-amber-950/20';
                icon = <MinusCircle className="w-4 h-4 text-amber-400" />;
              } else {
                cardStyle = 'border-rose-500/30 bg-rose-950/20';
                icon = <XCircle className="w-4 h-4 text-rose-400" />;
              }

              return (
                <div key={p.numero} className={`border rounded-xl p-3 space-y-2 ${cardStyle} break-inside-avoid print:bg-slate-50 print:border-slate-300 print:p-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white print:text-slate-900">N° {p.numero}</span>
                    {icon}
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between text-slate-400 print:text-slate-600">
                      <span>Tu respuesta:</span>
                      <strong className={`font-mono ${esCorrecta ? 'text-emerald-400 print:text-emerald-700' : omitida ? 'text-amber-400 print:text-amber-700' : 'text-rose-400 print:text-rose-700'}`}>
                        {p.opcionElegida || 'Omitida'}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-400 print:text-slate-600">
                      <span>Correcta:</span>
                      <strong className="font-mono text-emerald-400 print:text-emerald-700">{p.claveCorrecta}</strong>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 print:text-slate-500 pt-1 border-t border-slate-800/40 print:border-slate-200 truncate">
                    {p.habilidad}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
