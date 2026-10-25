import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InfoMedicinal } from '@/components/info-medicinal';
import { Radius, type PaletteType } from '@/constants/palette';
import { usePalette } from '@/hooks/use-palette';
import { getPlantaById } from '../../data/plantasMedicinales';

export default function PlantaDetalle() {
  const router = useRouter();
  const Palette = usePalette();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const planta = getPlantaById(id);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={Palette.text} />
      </TouchableOpacity>

      {!planta ? (
        <Text style={styles.missing}>No encontramos esta planta.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.emoji}>{planta.emoji}</Text>
            <Text style={styles.name}>{planta.comunes.join(' · ')}</Text>
            <Text style={styles.sci}>{planta.cientifico}  ·  {planta.familia}</Text>
          </View>
          <InfoMedicinal planta={planta} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (Palette: PaletteType) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: Palette.bg },
    back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.card, alignItems: 'center', justifyContent: 'center', margin: 16 },
    scroll: { padding: 20, paddingTop: 0, paddingBottom: 40 },
    hero: { alignItems: 'center', backgroundColor: Palette.primarySoft, borderRadius: Radius.lg, paddingVertical: 24, paddingHorizontal: 16, marginBottom: 16 },
    emoji: { fontSize: 56 },
    name: { fontSize: 24, fontWeight: '800', color: Palette.text, marginTop: 8, textAlign: 'center' },
    sci: { fontSize: 13.5, fontStyle: 'italic', color: Palette.textSoft, marginTop: 2, textAlign: 'center' },
    missing: { textAlign: 'center', color: Palette.textSoft, marginTop: 40 },
  });
