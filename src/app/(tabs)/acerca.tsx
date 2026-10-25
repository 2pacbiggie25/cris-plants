import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/info-medicinal';
import { Radius, Shadow, type PaletteType } from '@/constants/palette';
import { usePalette } from '@/hooks/use-palette';

const PASOS = [
  { icon: 'camera', text: 'Apunta la cámara a una hoja, flor o fruto y toca el botón verde, o elige una foto de tu galería.' },
  { icon: 'sparkles', text: 'Pl@ntNet identifica la especie y te muestra qué tan segura es la coincidencia y otras opciones posibles.' },
  { icon: 'medkit', text: 'Lee para qué sirve, cómo se usa y qué precauciones tiene.' },
  { icon: 'bookmark', text: 'Guárdala en tu historial, márcala como favorita y añade una nota.' },
] as const;

export default function AcercaScreen() {
  const Palette = usePalette();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.logo}>🌿</Text>
          <Text style={styles.title}>CrisPlants</Text>
          <Text style={styles.subtitle}>Identifica plantas y descubre sus usos medicinales</Text>
        </View>

        <Text style={styles.section}>¿Cómo funciona?</Text>
        {PASOS.map((p, i) => (
          <View key={i} style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name={p.icon} size={20} color={Palette.primary} />
            </View>
            <Text style={styles.stepText}>{p.text}</Text>
          </View>
        ))}

        <Text style={styles.section}>Consejos para una buena foto</Text>
        <View style={styles.tips}>
          <Text style={styles.tip}>• Buena luz natural, sin sombras fuertes.</Text>
          <Text style={styles.tip}>• Una sola planta por foto, enfocando hojas o flores.</Text>
          <Text style={styles.tip}>• Acércate sin perder nitidez.</Text>
          <Text style={styles.tip}>• Si repites la misma foto, la respuesta sale al instante y no gasta una petición.</Text>
        </View>

        <Aviso />
        <Text style={styles.credit}>Identificación por Pl@ntNet · Versión 1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (Palette: PaletteType) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: Palette.bg },
    scroll: { padding: 20, paddingBottom: 40 },
    hero: { alignItems: 'center', backgroundColor: Palette.primary, borderRadius: Radius.lg, padding: 24, marginBottom: 8 },
    logo: { fontSize: 48 },
    title: { fontSize: 28, fontWeight: '800', color: '#fff' },
    subtitle: { color: '#E3F1E6', textAlign: 'center', marginTop: 4 },
    section: { fontSize: 18, fontWeight: '700', color: Palette.text, marginTop: 20, marginBottom: 10 },
    step: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Palette.card, borderRadius: Radius.md, padding: 12, marginBottom: 8, ...Shadow },
    stepIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
    stepText: { flex: 1, color: Palette.text, fontSize: 14.5, lineHeight: 20 },
    tips: { backgroundColor: Palette.card, borderRadius: Radius.md, padding: 14, marginBottom: 16, ...Shadow },
    tip: { color: Palette.text, fontSize: 14.5, lineHeight: 22 },
    credit: { textAlign: 'center', color: Palette.textSoft, fontSize: 12, marginTop: 16 },
  });
