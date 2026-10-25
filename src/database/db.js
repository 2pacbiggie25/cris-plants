// src/database/db.js
import * as SQLite from 'expo-sqlite';

let dbPromise = null;

// Una sola conexión reutilizada ('plantas.db' se crea sola en el dispositivo)
export const openDatabase = () => {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync('plantas.db');
  return dbPromise;
};

export const initDatabase = async () => {
  try {
    const db = await openDatabase();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS historial (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        familia TEXT,
        fecha TEXT
      );
      CREATE TABLE IF NOT EXISTS cache (
        hash TEXT PRIMARY KEY,
        json TEXT NOT NULL,
        fecha INTEGER
      );
    `);

    // Migración: agrega columnas nuevas si la tabla viene de una versión anterior
    const columnas = (await db.getAllAsync('PRAGMA table_info(historial);')).map((c) => c.name);
    const nuevas = {
      foto: 'TEXT',
      cientifico: 'TEXT',
      confianza: 'INTEGER',
      imagen: 'TEXT',
      favorito: 'INTEGER DEFAULT 0',
      nota: 'TEXT',
    };
    for (const [nombre, tipo] of Object.entries(nuevas)) {
      if (!columnas.includes(nombre)) {
        await db.execAsync(`ALTER TABLE historial ADD COLUMN ${nombre} ${tipo};`);
      }
    }
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
};

export const insertPlant = async ({ nombre, cientifico, familia, foto, imagen, confianza, favorito, nota }) => {
  const db = await openDatabase();
  const fecha = new Date().toLocaleDateString();
  const res = await db.runAsync(
    'INSERT INTO historial (nombre, cientifico, familia, foto, imagen, confianza, favorito, nota, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [nombre, cientifico ?? nombre, familia, foto ?? null, imagen ?? null, confianza ?? 0, favorito ? 1 : 0, nota ?? null, fecha]
  );
  return res.lastInsertRowId;
};

export const getPlantHistory = async () => {
  try {
    const db = await openDatabase();
    return await db.getAllAsync('SELECT * FROM historial ORDER BY id DESC;');
  } catch (error) {
    console.error('Error al obtener el historial:', error);
    return [];
  }
};

export const updatePlant = async (id, campos) => {
  const { favorito, nota } = campos;
  const db = await openDatabase();
  if (favorito !== undefined) await db.runAsync('UPDATE historial SET favorito = ? WHERE id = ?;', [favorito ? 1 : 0, id]);
  if (nota !== undefined) await db.runAsync('UPDATE historial SET nota = ? WHERE id = ?;', [nota, id]);
};

export const deletePlant = async (id) => {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM historial WHERE id = ?;', [id]);
};

// Caché de identificaciones: misma foto (mismo hash) = no se vuelve a gastar una petición
export const getCachedResult = async (hash) => {
  try {
    const db = await openDatabase();
    const row = await db.getFirstAsync('SELECT json FROM cache WHERE hash = ?;', [hash]);
    return row ? JSON.parse(row.json) : null;
  } catch {
    return null;
  }
};

export const setCachedResult = async (hash, data) => {
  try {
    const db = await openDatabase();
    await db.runAsync('INSERT OR REPLACE INTO cache (hash, json, fecha) VALUES (?, ?, ?);', [hash, JSON.stringify(data), Date.now()]);
    // Conserva solo las últimas 200 entradas
    await db.runAsync('DELETE FROM cache WHERE hash NOT IN (SELECT hash FROM cache ORDER BY fecha DESC LIMIT 200);');
  } catch (error) {
    console.error('No se pudo guardar en la caché:', error);
  }
};
