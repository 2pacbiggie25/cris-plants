import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radius, Shadow, type PaletteType } from '@/constants/palette';
import { usePalette } from '@/hooks/use-palette';
import { buscarInfoMedicinal } from '../../data/plantasMedicinales';
import { deletePlant, getPlantHistory } from '../../database/db';
import { borrarFoto } from '../../utils/fotos';

type Item = {
  id: number; nombre: string; cientifico: string | null; familia: string; fecha: string;
  foto: string | null; imagen: string | null; confianza: number | null; favorito: number | null; nota: string | null;
};

export default function HistorialScreen() {
  const router = useRouter();
  const Palette = usePalette();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [soloFavs, setSoloFavs] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getPlantHistory().then((rows: Item[]) => {
        if (active) {
          setItems(rows);
          setLoading(false);
        }
      });
      return () => { active = false; };
    }, [])
  );

  const visibles = useMemo(() => (soloFavs ? items.filter((i) => i.favorito) : items), [items, soloFavs]);

  const borrar = (item: Item) =>
    Alert.alert('Eliminar', `¿Quitar "${item.nombre}" del historial?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deletePlant(item.id);
          borrarFoto(item.foto);
          setItems((prev) => prev.filter((i) => i.id !== item.id));
        },
      },
    ]);

  const abrir = (item: Item) =>
    router.push({
      pathname: '/resultado',
      params: {
        id: String(item.id),
        foto: item.foto ?? '',
        favorito: item.favorito ? '1' : '0',
        nota: item.nota ?? '',
        candidatas: JSON.stringify([{
          nombre: item.nombre,
          cientifico: item.cientifico ?? item.nombre,
          familia: item.familia ?? '',
          confianza: item.confianza ?? 0,
          imagen: item.imagen ?? '',
        }]),
      },
    });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Historial</Text>
          <Text style={styles.subtitle}>{items.length} {items.length === 1 ? 'planta guardada' : 'plantas guardadas'}</Text>
        </View>
        <TouchableOpacity style={[styles.filter, soloFavs && styles.filterActive]} onPress={() => setSoloFavs((v) => !v)}>
          <Ionicons name={soloFavs ? 'heart' : 'heart-outline'} size={16} color={soloFavs ? '#fff' : Palette.primary} />
          <Text style={[styles.filterText, soloFavs && { color: '#fff' }]}>Favoritas</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Palette.primary} />
      ) : (
        <FlatList
          data={visibles}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name={soloFavs ? 'heart-outline' : 'leaf-outline'} size={40} color={Palette.primary} />
              </View>
              <Text style={styles.emptyTitle}>{soloFavs ? 'Sin favoritas todavía' : 'Aún no hay plantas'}</Text>
              <Text style={styles.emptyText}>
                {soloFavs ? 'Toca el corazón en una planta para marcarla.' : 'Escanea una planta y pulsa "Guardar" para verla aquí.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const info = buscarInfoMedicinal(item.cientifico ?? item.nombre, item.familia);
            const uso = info?.planta?.usos[0];
            const thumb = item.imagen || item.foto;
            return (
              <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => abrir(item)}>
                {thumb ? (
                  <Image source={{ uri: thumb }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbEmpty]}>
                    <Ionicons name="leaf" size={26} color={Palette.primary} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{item.nombre}</Text>
                    {item.favorito ? <Ionicons name="heart" size={14} color={Palette.danger} /> : null}
                  </View>
                  <Text style={styles.sci} numberOfLines={1}>{item.cientifico ?? item.familia}</Text>
                  {uso && <Text style={styles.use} numberOfLines={1}>💊 {uso}</Text>}
                  {item.nota ? <Text style={styles.noteText} numberOfLines={1}>📝 {item.nota}</Text> : null}
                  <Text style={styles.date}>{item.fecha}</Text>
                </View>
                <TouchableOpacity hitSlop={10} onPress={() => borrar(item)}>
                  <Ionicons name="trash-outline" size={20} color={Palette.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (Palette: PaletteType) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: Palette.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
    title: { fontSize: 26, fontWeight: '800', color: Palette.text },
    subtitle: { color: Palette.textSoft, marginTop: 2 },
    filter: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: Palette.primary, borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
    filterActive: { backgroundColor: Palette.primary },
    filterText: { color: Palette.primary, fontWeight: '700', fontSize: 13 },
    list: { padding: 20, paddingBottom: 40, gap: 12, flexGrow: 1 },
    card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Palette.card, borderRadius: Radius.md, padding: 12, ...Shadow },
    thumb: { width: 64, height: 64, borderRadius: 14 },
    thumbEmpty: { backgroundColor: Palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { flexShrink: 1, fontSize: 16, fontWeight: '700', color: Palette.text },
    sci: { fontSize: 12.5, fontStyle: 'italic', color: Palette.textSoft },
    use: { fontSize: 12.5, color: Palette.text, marginTop: 3 },
    noteText: { fontSize: 12.5, color: Palette.textSoft, marginTop: 2 },
    date: { fontSize: 11.5, color: Palette.textSoft, marginTop: 3 },
    empty: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 60 },
    emptyIcon: { width: 84, height: 84, borderRadius: 42, backgroundColor: Palette.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: Palette.text },
    emptyText: { color: Palette.textSoft, textAlign: 'center', marginTop: 6, paddingHorizontal: 30 },
  });
