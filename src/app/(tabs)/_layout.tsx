import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';

import { Shadow, type PaletteType } from '@/constants/palette';
import { usePalette } from '@/hooks/use-palette';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const icon = (active: IconName, inactive: IconName) =>
  function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? active : inactive} size={size} color={color as string} />;
  };

export default function TabsLayout() {
  const Palette = usePalette();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.textSoft,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 6, backgroundColor: Palette.card, borderTopColor: Palette.border },
      }}>
      <Tabs.Screen name="plantas" options={{ title: 'Plantas', tabBarIcon: icon('leaf', 'leaf-outline') }} />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Escanear',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700', color: Palette.primary },
          tabBarIcon: ({ size }) => (
            <View style={styles.scanIcon}>
              <Ionicons name="scan" size={size + 6} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="historial" options={{ title: 'Historial', tabBarIcon: icon('time', 'time-outline') }} />
      <Tabs.Screen name="acerca" options={{ title: 'Acerca', tabBarIcon: icon('information-circle', 'information-circle-outline') }} />
    </Tabs>
  );
}

const makeStyles = (Palette: PaletteType) =>
  StyleSheet.create({
    scanIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: Palette.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -22,
      borderWidth: 4,
      borderColor: Palette.bg,
      ...Shadow,
    },
  });
