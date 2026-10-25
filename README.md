# 🌿 CrisPlants

App móvil (Expo / React Native) para **identificar plantas con la cámara** y consultar **para qué sirven en términos medicinales**.

## Funciones

- **Escáner** con cámara o desde la galería, usando la API de [Pl@ntNet](https://my.plantnet.org/).
- **Otras coincidencias:** si la primera no convence, eliges entre las 5 candidatas.
- **Información medicinal** en español: usos, parte usada, preparación y precauciones (catálogo local de ~59 plantas, funciona sin internet).
- **Catálogo** con buscador por nombre o por uso ("sueño", "digestión"...).
- **Historial** con foto de referencia, favoritas y notas personales (SQLite).
- **Caché de identificaciones:** la misma foto no gasta otra petición a la API.
- Modo claro y oscuro.

> ⚠️ La información medicinal es orientativa, basada en usos tradicionales, y **no sustituye el consejo de un profesional de la salud**.

## Puesta en marcha

```bash
npm install
cp .env.example .env     # y pon tu clave de Pl@ntNet
npx expo start -c
```

Abre la app con **Expo Go** (misma versión de SDK que el proyecto) escaneando el QR.

La clave se obtiene gratis en <https://my.plantnet.org/>. El archivo `.env` está en `.gitignore`: **nunca lo subas**.

## Generar la app (APK de Android)

```bash
npm i -g eas-cli
eas login
eas env:create --name EXPO_PUBLIC_PLANTNET_KEY --value "TU_CLAVE" --environment preview --visibility sensitive
eas build -p android --profile preview
```

Al terminar, EAS entrega un enlace para descargar e instalar el `.apk`.

> Las variables `EXPO_PUBLIC_*` quedan dentro de la app compilada. Para uso personal es aceptable; si la app se hace pública, conviene poner un servidor intermedio que guarde la clave.

## Stack

Expo SDK 58 · Expo Router · expo-camera · expo-image-picker · expo-sqlite · expo-file-system · React Native Reanimated
