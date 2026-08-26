import { db, isFirebaseConfigured } from './firebaseClient';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import ensayoDiagnostico from '../data/ensayoDiagnostico2026.json';
import ensayo3 from '../data/ensayo3.json';
import tablaDemre from '../data/tablaDemre.json';

const STORAGE_KEY = 'profekarlos_intentos_ensayos';
const COLLECTION_NAME = 'intentos_ensayos';

// Admin access PIN (configurable desde variables de entorno)
export const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || 'Kapacord#2026';

export const ENSAYOS = {
  [ensayoDiagnostico.id]: ensayoDiagnostico,
  [ensayo3.id]: ensayo3
};

export function obtenerEnsayoData(ensayoId) {
  return ENSAYOS[ensayoId] || ENSAYOS[ensayo3.id];
}

/**
 * Califica un ensayo completo del estudiante
 */
export function calificarEnsayo({ ensayoId, nombre, apellido, email, respuestas }) {
  const ensayoData = obtenerEnsayoData(ensayoId);
  
  let correctasValidas = 0;
  let incorrectasValidas = 0;
  let omitidasValidas = 0;

  const desglosePreguntas = [];

  // Se calculará dinámicamente según las habilidades presentes en la pauta
  const habilidadesStats = {};

  ensayoData.preguntas.forEach((p) => {
    const qNum = p.numero;
    const opcionElegida = respuestas[qNum] || null; // 'A', 'B', 'C', 'D' o null
    const esCorrecta = !p.es_piloto && opcionElegida === p.clave;

    if (!p.es_piloto) {
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

  // Guardar intento en LocalStorage para redundancia
  guardarEnLocalStorage(nuevoIntento);

  // Guardar en Firebase Cloud Firestore
  guardarEnFirestore(nuevoIntento);

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
 * Guarda el intento en Cloud Firestore (asíncrono)
 */
async function guardarEnFirestore(intento) {
  try {
    if (!isFirebaseConfigured) {
      console.warn('Firebase no está configurado o faltan credenciales.');
      return;
    }

    const docRef = doc(db, COLLECTION_NAME, intento.id);
    await setDoc(docRef, {
      ...intento,
      createdAt: serverTimestamp()
    });
    console.info(`[Firestore] Intento ${intento.id} guardado exitosamente.`);
  } catch (e) {
    console.warn('Error guardando en Cloud Firestore:', e);
  }
}

/**
 * Obtener todos los intentos para el Panel Admin
 */
export async function obtenerTodosLosIntentos() {
  const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  try {
    if (isFirebaseConfigured) {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('fecha', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const remotos = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        remotos.push({
          id: docSnap.id,
          fecha: data.fecha,
          ensayoId: data.ensayoId,
          ensayoTitulo: data.ensayoTitulo || obtenerEnsayoData(data.ensayoId)?.titulo || 'Ensayo Desconocido',
          nombreEstudiante: data.nombreEstudiante,
          emailEstudiante: data.emailEstudiante,
          puntajePaes: data.puntajePaes,
          correctas: data.correctas,
          incorrectas: data.incorrectas,
          omitidas: data.omitidas,
          habilidadesResumen: data.habilidadesResumen,
          desglosePreguntas: data.desglosePreguntas,
          respuestasOriginales: data.respuestasOriginales
        });
      });

      if (remotos.length > 0) {
        // Combinar evitando duplicados por ID y normalizar títulos
        const map = new Map();
        [...remotos, ...local].forEach((item) => {
          const ensayoNorm = obtenerEnsayoData(item.ensayoId);
          map.set(item.id, {
            ...item,
            ensayoTitulo: ensayoNorm?.titulo || 'Ensayo Desconocido'
          });
        });
        return Array.from(map.values()).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
    }
  } catch (err) {
    console.warn('Usando respaldo local para obtener intentos:', err);
  }

  return local.map(item => ({
    ...item,
    ensayoTitulo: obtenerEnsayoData(item.ensayoId)?.titulo || 'Ensayo Desconocido'
  }));
}

/**
 * Elimina un intento por ID tanto en local como en Firestore
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

  // Eliminar en Firestore
  try {
    if (isFirebaseConfigured) {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      console.info(`[Firestore] Intento ${id} eliminado exitosamente.`);
    }
  } catch (err) {
    console.warn('Error eliminando en Cloud Firestore:', err);
  }
}
