import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Radius, Shadow, type PaletteType } from '@/constants/palette';
import { usePalette } from '@/hooks/use-palette';
import { AVISO } from '../data/plantasMedicinales';

type Planta = {
  descripcion: string;
  usos: string[];
  partes: string;
  preparacion: string;
  precauciones: string;
};

function useStyles() {
  const Palette = usePalette();
  return { Palette, styles: useMemo(() => makeStyles(Palette), [Palette]) };
}

export function Card({ icon, title, children, tint }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  children: React.ReactNode;
  tint?: string;
}) {
  const { Palette, styles } = useStyles();
  const color = tint ?? Palette.primary;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: color + '26' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export function InfoMedicinal({ planta }: { planta: Planta }) {
  const { Palette, styles } = useStyles();
  return (
    <View>
      <Text style={styles.description}>{planta.descripcion}</Text>

      <Card icon="medkit" title="¿Para qué sirve?">
        {planta.usos.map((u) => (
          <View key={u} style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.body}>{u}</Text>
          </View>
        ))}
      </Card>

      <Card icon="flask" title="Parte usada y preparación" tint="#3B82A0">
        <Text style={styles.body}>
          <Text style={styles.bold}>Parte: </Text>
          {planta.partes}
        </Text>
        <Text style={[styles.body, { marginTop: 6 }]}>
          <Text style={styles.bold}>Cómo se usa: </Text>
          {planta.preparacion}
        </Text>
      </Card>

      <Card icon="warning" title="Precauciones" tint={Palette.danger}>
        <Text style={styles.body}>{planta.precauciones}</Text>
      </Card>

      <Aviso />
    </View>
  );
}

export function Aviso() {
  const { Palette, styles } = useStyles();
  return (
    <View style={styles.aviso}>
      <Ionicons name="alert-circle" size={18} color={Palette.warningText} />
      <Text style={styles.avisoText}>{AVISO}</Text>
    </View>
  );
}

const makeStyles = (Palette: PaletteType) =>
  StyleSheet.create({
    description: { color: Palette.textSoft, fontSize: 15, lineHeight: 22, marginBottom: 14 },
    card: { backgroundColor: Palette.card, borderRadius: Radius.md, padding: 16, marginBottom: 12, ...Shadow },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    iconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: Palette.text },
    bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
    bullet: { color: Palette.primary, fontSize: 16, lineHeight: 21 },
    body: { flex: 1, color: Palette.text, fontSize: 14.5, lineHeight: 21 },
    bold: { fontWeight: '700' },
    aviso: { flexDirection: 'row', gap: 8, backgroundColor: Palette.warningBg, borderRadius: Radius.sm, padding: 12, marginTop: 4 },
    avisoText: { flex: 1, color: Palette.warningText, fontSize: 12.5, lineHeight: 18 },
  });
