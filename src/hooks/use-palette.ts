import { useColorScheme } from 'react-native';

import { darkPalette, lightPalette, type PaletteType } from '@/constants/palette';

export function usePalette(): PaletteType {
  return useColorScheme() === 'dark' ? darkPalette : lightPalette;
}
