import { supabase } from './supabaseClient';
import ensayoData from '../data/ensayoDiagnostico2026.json';
import tablaDemre from '../data/tablaDemre.json';

const STORAGE_KEY = 'profekarlos_intentos_ensayos';

// Admin access PIN
export const ADMIN_PIN = 'Kapacord#2026';

/**
 * Califica un ensayo completo del estudiante
 */
export function calificarEnsayo({ nombre, apellido, email, respuestas }) {
  let correctasValidas = 0;
  let incorrectasValidas = 0;
  let omitidasValidas = 0;
  let pilotoRespondidas = 0;

  const desglosePreguntas = [];

  const habilidadesStats = {
    Localizar: { total: 0, correctas: 0 },
    Interpretar: { total: 0, correctas: 0 },
    Evaluar: { total: 0, correctas: 0 }
  };

  ensayoData.preguntas.forEach((p) => {
    const qNum = p.numero;
    const opcionElegida = respuestas[qNum] || null; // 'A', 'B', 'C', 'D' o null
    const esCorrecta = !p.es_piloto && opcionElegida === p.clave;

    if (p.es_piloto) {
      if (opcionElegida) pilotoRespondidas++;
    } else {
      // Habilidad tracking
      const hab = p.habilidad || 'Interpretar';
      if (!habilidadesStats[hab]) {
        habilidadesStats[hab] = { total: 0, correctas: 0 };
      }
      habilidadesStats[hab].total += 1;

      if (!opcionElegida) {
        omitidasValidas++;
      } else if (esCorrecta) {
        correctasValidas++;
        habilidadesStats[hab].correctas += 1;
      } else {
        incorrectasValidas++;
      }
    }

    desglosePreguntas.push({
      numero: qNum,
      opcionElegida,
      claveCorrecta: p.clave,
      habilidad: p.habilidad,
      esPiloto: p.es_piloto,
      esCorrecta: p.es_piloto ? null : esCorrecta
    });
  });

  // Calcular puntaje PAES según la tabla DEMRE (0 a 60 buenas)
  const puntajePaes = tablaDemre[correctasValidas] ?? 100;

  // Formatear porcentaje por habilidades
  const habilidadesResumen = {};
  Object.keys(habilidadesStats).forEach((hab) => {
    const stat = habilidadesStats[hab];
    habilidadesResumen[hab] = {
      total: stat.total,
      correctas: stat.correctas,
      porcentaje: stat.total > 0 ? Math.round((stat.correctas / stat.total) * 100) : 0
    };
  });

  const nuevoIntento = {
    id: 'intento_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    fecha: new Date().toISOString(),
    ensayoId: ensayoData.id,
    ensayoTitulo: ensayoData.titulo,
    nombreEstudiante: `${nombre.trim()} ${apellido.trim()}`,
    emailEstudiante: email.trim().toLowerCase(),
    correctas: correctasValidas,
    incorrectas: incorrectasValidas,
    omitidas: omitidasValidas,
    pilotoCount: ensayoData.preguntas_piloto_count || 5,
    puntajePaes,
    habilidadesResumen,
    desglosePreguntas,
    respuestasOriginales: respuestas
  };

  // Guardar intento en LocalStorage
  guardarEnLocalStorage(nuevoIntento);

  // Intentar guardar en Supabase si está disponible
  guardarEnSupabase(nuevoIntento);

  return nuevoIntento;
}

/**
 * Guarda el intento en el almacenamiento local del navegador
 */
function guardarEnLocalStorage(intento) {
  try {
    const existentes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existentes.unshift(intento);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existentes));
  } catch (err) {
    console.error('Error guardando en localStorage:', err);
  }
}

/**
 * Guarda el intento en la tabla 'intentos_ensayos' de Supabase (asíncrono)
 */
async function guardarEnSupabase(intento) {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      return;
    }
    const { error } = await supabase.from('intentos_ensayos').insert([
      {
        id: intento.id,
        fecha: intento.fecha,
        ensayo_id: intento.ensayoId,
        nombre_estudiante: intento.nombreEstudiante,
        email_estudiante: intento.emailEstudiante,
        puntaje_paes: intento.puntajePaes,
        correctas: intento.correctas,
        incorrectas: intento.incorrectas,
        omitidas: intento.omitidas,
        habilidades: intento.habilidadesResumen,
        desglose: intento.desglosePreguntas
      }
    ]);
    if (error) {
      console.warn('Advertencia guardando en Supabase:', error.message);
    }
  } catch (e) {
    console.warn('Supabase no disponible:', e);
  }
}

/**
 * Obtener todos los intentos para el Panel Admin
 */
export async function obtenerTodosLosIntentos() {
  const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  try {
    if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const { data, error } = await supabase
        .from('intentos_ensayos')
        .select('*')
        .order('fecha', { ascending: false });
      
      if (!error && data && data.length > 0) {
        // Mapear campos de Supabase a la estructura interna
        const remotos = data.map((d) => ({
          id: d.id,
          fecha: d.fecha,
          ensayoId: d.ensayo_id,
          ensayoTitulo: ensayoData.titulo,
          nombreEstudiante: d.nombre_estudiante,
          emailEstudiante: d.email_estudiante,
          puntajePaes: d.puntaje_paes,
          correctas: d.correctas,
          incorrectas: d.incorrectas,
          omitidas: d.omitidas,
          habilidadesResumen: d.habilidades,
          desglosePreguntas: d.desglose
        }));

        // Combinar evitando duplicados por ID
        const map = new Map();
        [...remotos, ...local].forEach((item) => map.set(item.id, item));
        return Array.from(map.values()).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    }
  } catch (err) {
    console.warn('Usando respaldo local para obtener intentos:', err);
  }

  return local;
}

/**
 * Elimina un intento por ID tanto en local como en Supabase
 */
export async function eliminarIntento(id) {
  // Eliminar localmente
  try {
    const existentes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const actualizados = existentes.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
  } catch (err) {
    console.error('Error eliminando en localStorage:', err);
  }

  // Eliminar en Supabase
  try {
    if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const { error } = await supabase.from('intentos_ensayos').delete().match({ id });
      if (error) {
        console.warn('Error eliminando en Supabase:', error.message);
      }
    }
  } catch (err) {
    console.warn('Supabase no disponible para eliminar:', err);
  }
}
