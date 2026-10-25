import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

// Mismo fondo e imagen que el splash nativo (app.json) para que la transición sea continua
export const SPLASH_BG = '#1F5C39';
const SPLASH_SIZE = 240;

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <Animated.View
      exiting={FadeOut.duration(450)}
      style={styles.overlay}
      onLayout={() => {
        // Pequeña pausa para que se vea la marca antes de revelar la app
        setTimeout(() => {
          SplashScreen.hideAsync().finally(() => setVisible(false));
        }, 500);
      }}>
      <Image style={styles.image} source={require('@/assets/images/splash-icon.png')} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: SPLASH_BG,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  image: { width: SPLASH_SIZE, height: SPLASH_SIZE },
});
