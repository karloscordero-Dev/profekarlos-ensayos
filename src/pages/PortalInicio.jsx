import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, ArrowRight } from 'lucide-react';

export default function PortalInicio() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-emerald-500/30">
      {/* Navbar Simple */}
      <nav className="border-b border-[#1a1f2e] bg-[#0c0f17]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-xl text-white tracking-wide">ProfeKarlos</span>
            <span className="text-emerald-400 font-semibold text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Ensayos</span>
          </div>
          <button 
            onClick={() => navigate('/admin')}
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-[#151926]"
          >
            Acceso Profesor
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12 md:py-20 space-y-12">
        
        {/* Encabezado */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Plataforma</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            Ensayos PAES
          </h1>
          <p className="text-slate-400 text-lg">
            Rinde tus evaluaciones de Competencia Lectora, obtén tu puntaje inmediatamente y revisa tu desempeño por habilidades.
          </p>
        </div>

        {/* Lista de Ensayos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          
          {/* Tarjeta Ensayo Diagnóstico */}
          <div className="bg-[#0f131d]/90 border border-[#1e2538] rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/50 hover:bg-[#141a27] transition-all group shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-400 mb-1 font-mono">EN CURSO</div>
                <h3 className="text-xl font-bold text-white mb-2">Ensayo Diagnóstico 2026</h3>
                <p className="text-sm text-slate-400">
                  Evaluación inicial de 65 preguntas. Mide tu base antes de comenzar el intensivo.
                </p>
              </div>
            </div>
            
            <div className="pt-6 mt-6 border-t border-[#1e2538]">
              <button 
                onClick={() => navigate('/ensayo/diagnostico')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                Comenzar Ensayo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tarjeta Ensayo 3 */}
          <div className="bg-[#0f131d]/90 border border-[#1e2538] rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/50 hover:bg-[#141a27] transition-all group shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-400 mb-1 font-mono">NUEVO</div>
                <h3 className="text-xl font-bold text-white mb-2">Ensayo 3</h3>
                <p className="text-sm text-slate-400">
                  Evaluación de Competencia Lectora. Incluye subdivisión en habilidad de Interpretar.
                </p>
              </div>
            </div>
            
            <div className="pt-6 mt-6 border-t border-[#1e2538]">
              <button 
                onClick={() => navigate('/ensayo/ensayo_3')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                Comenzar Ensayo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>



        </div>
      </main>
    </div>
  );
}
