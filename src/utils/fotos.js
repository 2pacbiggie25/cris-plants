import { Directory, File, Paths } from 'expo-file-system';

// Las fotos de la cámara viven en la caché y el sistema puede borrarlas.
// Al guardar, se copian a una carpeta permanente de la app.
export const guardarFotoPermanente = (uri) => {
  if (!uri) return null;
  try {
    const dir = new Directory(Paths.document, 'fotos');
    dir.create({ idempotent: true, intermediates: true });
    const destino = new File(dir, `planta-${Date.now()}.jpg`);
    new File(uri).copy(destino);
    return destino.uri;
  } catch (error) {
    console.warn('No se pudo guardar la foto de forma permanente:', error);
    return uri;
  }
};

export const borrarFoto = (uri) => {
  try {
    if (uri && uri.includes('/fotos/')) {
      const f = new File(uri);
      if (f.exists) f.delete();
    }
  } catch (error) {
    console.warn('No se pudo borrar la foto:', error);
  }
};
