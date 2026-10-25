import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso, InfoMedicinal } from '@/components/info-medicinal';
import { Radius, Shadow, type PaletteType } from '@/constants/palette';
import { usePalette } from '@/hooks/use-palette';
import { buscarInfoMedicinal } from '../data/plantasMedicinales';
import { insertPlant, updatePlant } from '../database/db';
import { guardarFotoPermanente } from '../utils/fotos';

type Candidata = { nombre: string; cientifico: string; familia: string; confianza: number; imagen: string };

export default function ResultadoScreen() {
  const router = useRouter();
  const Palette = usePalette();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);
  const p = useLocalSearchParams<{
    foto?: string; candidatas?: string; id?: string; favorito?: string; nota?: string;
  }>();

  // Si viene del historial (id) la planta ya está guardada: favorito y nota se actualizan al momento
  const idGuardado = p.id ? Number(p.id) : null;
  const candidatas: Candidata[] = useMemo(() => {
    try {
      return JSON.parse(p.candidatas ?? '[]');
    } catch {
      return [];
    }
  }, [p.candidatas]);

  const [idx, setIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [fav, setFav] = useState(p.favorito === '1');
  const [nota, setNota] = useState(p.nota ?? '');

  const cur = candidatas[idx];
  if (!cur) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.low}>No hay datos de esta planta.</Text>
      </SafeAreaView>
    );
  }

  const info = buscarInfoMedicinal(cur.cientifico, cur.familia);
  const confianza = cur.confianza;
  const barColor = confianza >= 60 ? Palette.primary : confianza >= 30 ? Palette.accent : Palette.danger;
  const hero = p.foto || cur.imagen;

  const toggleFav = async () => {
    Haptics.selectionAsync();
    const nuevo = !fav;
    setFav(nuevo);
    if (idGuardado) await updatePlant(idGuardado, { favorito: nuevo });
  };

  const guardarNota = async () => {
    if (idGuardado) await updatePlant(idGuardado, { nota: nota.trim() });
  };

  const guardar = async () => {
    try {
      await insertPlant({
        nombre: cur.nombre,
        cientifico: cur.cientifico,
        familia: cur.familia,
        foto: guardarFotoPermanente(p.foto),
        imagen: cur.imagen,
        confianza,
        favorito: fav,
        nota: nota.trim() || null,
      });
      setSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/');
    } catch {
      Alert.alert('Error', 'No se pudo guardar en el historial.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View>
          {hero ? <Image source={{ uri: hero }} style={styles.photo} /> : <View style={[styles.photo, { backgroundColor: Palette.primarySoft }]} />}
          <SafeAreaView edges={['top']} style={styles.topRow} pointerEvents="box-none">
            <TouchableOpacity style={styles.roundBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#1D3326" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.roundBtn} onPress={toggleFav}>
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={22} color={fav ? '#D1495B' : '#1D3326'} />
            </TouchableOpacity>
          </SafeAreaView>
          {p.foto && cur.imagen ? (
            <View style={styles.refBadge}>
              <Image source={{ uri: cur.imagen }} style={styles.refImg} />
              <Text style={styles.refText}>Referencia</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.sheet}>
          {candidatas.length > 1 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.sectionLabel}>¿Quizás es…?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {candidatas.map((c, i) => (
                  <TouchableOpacity
                    key={c.cientifico + i}
                    style={[styles.chip, i === idx && styles.chipActive]}
                    onPress={() => setIdx(i)}>
                    <Text style={[styles.chipText, i === idx && styles.chipTextActive]} numberOfLines={1}>
                      {c.nombre} · {c.confianza}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={styles.name}>{cur.nombre}</Text>
          <Text style={styles.sci}>{cur.cientifico}{cur.familia ? `  ·  ${cur.familia}` : ''}</Text>

          <View style={styles.confRow}>
            <Text style={styles.confLabel}>Coincidencia</Text>
            <Text style={[styles.confValue, { color: barColor }]}>{confianza}%</Text>
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.min(confianza, 100)}%`, backgroundColor: barColor }]} />
          </View>
          {confianza < 30 && <Text style={styles.low}>Coincidencia baja: prueba otra opción de arriba o toma otra foto más cercana.</Text>}

          <View style={{ height: 18 }} />

          {info?.planta ? (
            <>
              {info.nivel === 'genero' && (
                <Text style={styles.note}>No tenemos esta especie exacta; mostramos información de una planta del mismo género ({info.planta.comunes[0]}).</Text>
              )}
              <InfoMedicinal planta={info.planta} />
            </>
          ) : info?.texto ? (
            <>
              <View style={styles.famCard}>
                <Text style={styles.famTitle}>Familia {info.familia}</Text>
                <Text style={styles.famText}>{info.texto}</Text>
                <Text style={styles.famText}>Aún no tenemos los usos medicinales de esta especie en concreto.</Text>
              </View>
              <Aviso />
            </>
          ) : (
            <>
              <View style={styles.famCard}>
                <Text style={styles.famText}>Todavía no tenemos información medicinal de esta planta.</Text>
              </View>
              <Aviso />
            </>
          )}

          <View style={[styles.famCard, { marginTop: 14 }]}>
            <Text style={styles.famTitle}>Mi nota</Text>
            <TextInput
              style={styles.noteInput}
              value={nota}
              onChangeText={setNota}
              onBlur={guardarNota}
              placeholder="Ej. la del jardín de mi abuela"
              placeholderTextColor={Palette.textSoft}
              multiline
            />
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {idGuardado ? (
          <TouchableOpacity style={styles.primary} onPress={() => router.back()}>
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.primaryText}>Listo</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.secondary} onPress={() => router.back()}>
              <Ionicons name="scan" size={18} color={Palette.primary} />
              <Text style={styles.secondaryText}>Escanear otra</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primary, saved && { backgroundColor: Palette.textSoft }]} onPress={guardar} disabled={saved}>
              <Ionicons name={saved ? 'checkmark' : 'bookmark'} size={18} color="#fff" />
              <Text style={styles.primaryText}>{saved ? 'Guardada' : 'Guardar'}</Text>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (Palette: PaletteType) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: Palette.bg },
    scroll: { paddingBottom: 24 },
    photo: { width: '100%', height: 300 },
    topRow: { position: 'absolute', top: 0, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
    roundBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    refBadge: { position: 'absolute', right: 16, bottom: 40, alignItems: 'center' },
    refImg: { width: 62, height: 62, borderRadius: 14, borderWidth: 2, borderColor: '#fff' },
    refText: { color: '#fff', fontSize: 10.5, fontWeight: '700', marginTop: 2, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 4 },
    sheet: { marginTop: -28, backgroundColor: Palette.bg, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, padding: 20 },
    sectionLabel: { color: Palette.textSoft, fontWeight: '700', fontSize: 12.5, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
    chip: { maxWidth: 220, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Palette.card, borderWidth: 1, borderColor: Palette.border },
    chipActive: { backgroundColor: Palette.primary, borderColor: Palette.primary },
    chipText: { color: Palette.text, fontWeight: '600', fontSize: 13 },
    chipTextActive: { color: '#fff' },
    name: { fontSize: 26, fontWeight: '800', color: Palette.text },
    sci: { fontSize: 14, fontStyle: 'italic', color: Palette.textSoft, marginTop: 2, marginBottom: 16 },
    confRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    confLabel: { color: Palette.textSoft, fontWeight: '600' },
    confValue: { fontWeight: '800' },
    barBg: { height: 8, borderRadius: 4, backgroundColor: Palette.border, overflow: 'hidden' },
    barFill: { height: 8, borderRadius: 4 },
    low: { color: Palette.danger, fontSize: 12.5, marginTop: 6 },
    note: { color: Palette.textSoft, fontSize: 13, marginBottom: 10, fontStyle: 'italic' },
    famCard: { backgroundColor: Palette.card, borderRadius: Radius.md, padding: 16, marginBottom: 12, ...Shadow },
    famTitle: { fontWeight: '700', fontSize: 16, color: Palette.text, marginBottom: 6 },
    famText: { color: Palette.text, fontSize: 14.5, lineHeight: 21, marginBottom: 4 },
    noteInput: { color: Palette.text, fontSize: 14.5, minHeight: 44, textAlignVertical: 'top', padding: 0 },
    footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 10, backgroundColor: Palette.card, borderTopWidth: 1, borderTopColor: Palette.border },
    primary: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: Palette.primary, borderRadius: Radius.pill, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    primaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    secondary: { flex: 1, flexDirection: 'row', gap: 8, borderWidth: 1.5, borderColor: Palette.primary, borderRadius: Radius.pill, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    secondaryText: { color: Palette.primary, fontWeight: '700', fontSize: 15 },
  });
