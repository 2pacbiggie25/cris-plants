import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { getCachedResult, setCachedResult } from '../database/db';

const API_KEY = process.env.EXPO_PUBLIC_PLANTNET_KEY;
const ENDPOINT = 'https://my-api.plantnet.org/v2/identify/all';

const ERRORES = {
  sinClave: 'Falta la clave de Pl@ntNet. Agrega EXPO_PUBLIC_PLANTNET_KEY en el archivo .env y reinicia la app.',
  clave: 'La clave de Pl@ntNet no es válida o no tiene permiso (error 401/403).',
  noEncontrada: 'No reconocimos ninguna planta en la foto. Acércate más y enfoca hojas o flores.',
  cuota: 'Se alcanzó el límite diario de la API de Pl@ntNet. Intenta mañana.',
  red: 'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.',
  otro: 'Ocurrió un error al identificar la planta.',
};

// Convierte la respuesta de Pl@ntNet en una lista corta y ligera (es lo que se guarda en caché)
const aCandidatas = (results = []) =>
  results.slice(0, 5).map((r) => {
    const s = r.species ?? {};
    return {
      nombre: s.commonNames?.[0] ?? s.scientificNameWithoutAuthor ?? 'Desconocida',
      cientifico: s.scientificNameWithoutAuthor ?? 'Desconocida',
      familia: s.family?.scientificNameWithoutAuthor ?? s.family?.scientificName ?? '',
      confianza: Math.round((r.score ?? 0) * 100),
      imagen: r.images?.[0]?.url?.m ?? r.images?.[0]?.url?.o ?? '',
    };
  });

// Reduce la foto antes de enviarla: sube más rápido y la API no la necesita en alta resolución
const comprimir = async (uri) => {
  try {
    const ctx = ImageManipulator.manipulate(uri);
    ctx.resize({ width: 1024 });
    const img = await ctx.renderAsync();
    const out = await img.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
    return out.uri;
  } catch (error) {
    console.warn('No se pudo comprimir la foto, se envía la original:', error);
    return uri;
  }
};

/**
 * Identifica la planta de una foto.
 * Devuelve { ok: true, candidatas, cached } o { ok: false, error }.
 */
export const identifyPlant = async (imageUri) => {
  if (!imageUri) return { ok: false, error: ERRORES.otro };

  // 1) Misma foto que ya identificamos: respuesta de la caché, sin gastar petición
  let hash = null;
  try {
    hash = await new File(imageUri).digest('MD5');
    const guardado = await getCachedResult(hash);
    if (guardado?.length) return { ok: true, candidatas: guardado, cached: true };
  } catch (error) {
    console.warn('No se pudo calcular el hash de la foto:', error);
  }

  if (!API_KEY) return { ok: false, error: ERRORES.sinClave };

  try {
    const pequena = await comprimir(imageUri);

    // El fetch de Expo solo acepta Blob/File en FormData; File lee la foto desde su uri.
    const formData = new FormData();
    formData.append('images', new File(pequena));
    formData.append('organs', 'auto');

    const response = await fetch(`${ENDPOINT}?api-key=${API_KEY}&lang=es&nb-results=5&include-related-images=true`, {
      method: 'POST',
      body: formData,
    });

    if (response.status === 401 || response.status === 403) return { ok: false, error: ERRORES.clave };
    if (response.status === 404) return { ok: false, error: ERRORES.noEncontrada };
    if (response.status === 429) return { ok: false, error: ERRORES.cuota };
    if (!response.ok) {
      console.error('Pl@ntNet respondió', response.status, await response.text());
      return { ok: false, error: ERRORES.otro };
    }

    const data = await response.json();
    const candidatas = aCandidatas(data?.results);
    if (!candidatas.length) return { ok: false, error: ERRORES.noEncontrada };

    if (hash) await setCachedResult(hash, candidatas);
    return { ok: true, candidatas, cached: false };
  } catch (error) {
    console.error('Error al conectar con Pl@ntNet:', error);
    return { ok: false, error: ERRORES.red };
  }
};
