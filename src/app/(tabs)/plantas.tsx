import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radius, Shadow, type PaletteType } from '@/constants/palette';
import { usePalette } from '@/hooks/use-palette';
import { PLANTAS } from '../../data/plantasMedicinales';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function PlantasScreen() {
  const router = useRouter();
  const Palette = usePalette();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return PLANTAS;
    return PLANTAS.filter((p) =>
      norm([p.cientifico, p.familia, ...p.comunes, ...p.usos].join(' ')).includes(q)
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Plantas medicinales</Text>
        <Text style={styles.subtitle}>Busca por nombre o por lo que necesitas (ej. "digestión", "sueño")</Text>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={Palette.textSoft} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar planta o uso..."
            placeholderTextColor={Palette.textSoft}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Palette.textSoft} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.empty}>No encontramos plantas con "{query}".</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => router.push(`/planta/${item.id}` as any)}>
            <View style={styles.emojiBox}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>{item.comunes[0]}</Text>
            <Text style={styles.sci} numberOfLines={1}>{item.cientifico}</Text>
            <Text style={styles.use} numberOfLines={2}>{item.usos[0]}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const makeStyles = (Palette: PaletteType) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: Palette.bg },
    header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
    title: { fontSize: 26, fontWeight: '800', color: Palette.text },
    subtitle: { color: Palette.textSoft, marginTop: 2, marginBottom: 12, fontSize: 13.5 },
    search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Palette.card, borderRadius: Radius.pill, paddingHorizontal: 16, height: 46, ...Shadow },
    input: { flex: 1, color: Palette.text, fontSize: 15 },
    list: { padding: 20, paddingTop: 12, paddingBottom: 40, gap: 12 },
    card: { flex: 1, backgroundColor: Palette.card, borderRadius: Radius.md, padding: 14, ...Shadow },
    emojiBox: { width: 52, height: 52, borderRadius: 16, backgroundColor: Palette.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    emoji: { fontSize: 28 },
    name: { fontSize: 16, fontWeight: '700', color: Palette.text },
    sci: { fontSize: 12, fontStyle: 'italic', color: Palette.textSoft, marginBottom: 6 },
    use: { fontSize: 12.5, color: Palette.text, lineHeight: 17 },
    empty: { textAlign: 'center', color: Palette.textSoft, marginTop: 40 },
  });
