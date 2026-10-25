import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radius, type PaletteType } from '@/constants/palette';
import { usePalette } from '@/hooks/use-palette';
import { identifyPlant } from '../../api/plantApi';

export default function ScanScreen() {
  const router = useRouter();
  const Palette = usePalette();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permission}>
        <View style={styles.permissionIcon}>
          <Ionicons name="camera" size={44} color={Palette.primary} />
        </View>
        <Text style={styles.permissionTitle}>Activa la cámara</Text>
        <Text style={styles.permissionText}>
          La necesitamos para fotografiar la planta e identificarla. Solo se usa cuando escaneas.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Conceder permiso</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Compartido por la cámara y la galería
  const identificar = async (uri: string) => {
    const res = await identifyPlant(uri);
    if (!res.ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('No se pudo identificar', res.error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push({
      pathname: '/resultado',
      params: { foto: uri, candidatas: JSON.stringify(res.candidatas) },
    });
  };

  const handleScan = async () => {
    if (loading || !cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, skipProcessing: true });
      if (!photo?.uri) throw new Error('Sin foto');
      await identificar(photo.uri);
    } catch (error) {
      console.error('Error al escanear:', error);
      Alert.alert('Error', 'Ocurrió un error al procesar la imagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleGallery = async () => {
    if (loading) return;
    try {
      const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (picked.canceled || !picked.assets?.[0]?.uri) return;
      setLoading(true);
      await identificar(picked.assets[0].uri);
    } catch (error) {
      console.error('Error con la galería:', error);
      Alert.alert('Error', 'No se pudo abrir la imagen seleccionada.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} facing={facing} enableTorch={torch} ref={cameraRef} />

      <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Text style={styles.title}>Escanear planta</Text>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.roundBtn} onPress={() => setTorch((t) => !t)}>
              <Ionicons name={torch ? 'flash' : 'flash-off'} size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.roundBtn}
              onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}>
              <Ionicons name="camera-reverse" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.frameWrap} pointerEvents="none">
          <View style={styles.frame}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
          <Text style={styles.hint}>Centra una hoja o flor dentro del marco</Text>
        </View>
      </SafeAreaView>

      <View style={styles.bottom}>
        <View style={styles.sideSlot}>
          <TouchableOpacity style={styles.galleryBtn} onPress={handleGallery} disabled={loading}>
            <Ionicons name="images" size={22} color="#fff" />
            <Text style={styles.galleryText}>Galería</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.shutterRing} onPress={handleScan} disabled={loading} activeOpacity={0.8}>
          <View style={styles.shutter} />
        </TouchableOpacity>
        <View style={styles.sideSlot} />
      </View>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Analizando planta...</Text>
        </View>
      )}
    </View>
  );
}

const CORNER = 34;
const cornerBase = { position: 'absolute', width: CORNER, height: CORNER, borderColor: '#fff' } as const;

const makeStyles = (Palette: PaletteType) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    overlay: { ...StyleSheet.absoluteFill },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
    title: { color: '#fff', fontSize: 20, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 6 },
    topActions: { flexDirection: 'row', gap: 10 },
    roundBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
    frameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    frame: { width: 260, height: 260 },
    corner: cornerBase,
    tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 18 },
    tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 18 },
    bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 18 },
    br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 18 },
    hint: {
      marginTop: 22, color: '#fff', fontWeight: '600', fontSize: 14, paddingHorizontal: 14, paddingVertical: 8,
      backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: Radius.pill, overflow: 'hidden',
    },
    bottom: { position: 'absolute', bottom: 28, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 },
    sideSlot: { width: 80, alignItems: 'center' },
    galleryBtn: { alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: Radius.md, paddingVertical: 8, paddingHorizontal: 12 },
    galleryText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    shutterRing: { width: 82, height: 82, borderRadius: 41, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    shutter: { width: 64, height: 64, borderRadius: 32, backgroundColor: Palette.primary },
    loading: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },
    loadingText: { color: '#fff', marginTop: 12, fontWeight: '700', fontSize: 16 },
    permission: { flex: 1, backgroundColor: Palette.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
    permissionIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: Palette.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    permissionTitle: { fontSize: 22, fontWeight: '800', color: Palette.text, marginBottom: 8 },
    permissionText: { textAlign: 'center', color: Palette.textSoft, fontSize: 15, lineHeight: 22, marginBottom: 24 },
    permissionBtn: { backgroundColor: Palette.primary, paddingVertical: 14, paddingHorizontal: 28, borderRadius: Radius.pill },
    permissionBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  });
