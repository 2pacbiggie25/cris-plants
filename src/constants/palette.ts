export const lightPalette = {
  bg: '#F3F7F1',
  card: '#FFFFFF',
  primary: '#2E7D4F',
  primaryDark: '#1F5C39',
  primarySoft: '#E3F1E6',
  accent: '#F2B84B',
  text: '#1D3326',
  textSoft: '#6B7F72',
  border: '#DCE7DE',
  danger: '#D1495B',
  warningBg: '#FFF4DD',
  warningText: '#8A5A00',
};

export type PaletteType = typeof lightPalette;

export const darkPalette: PaletteType = {
  bg: '#0E1812',
  card: '#16251C',
  primary: '#4CB879',
  primaryDark: '#7BD6A0',
  primarySoft: '#1E3A2B',
  accent: '#F2B84B',
  text: '#E5F0E8',
  textSoft: '#93AA9B',
  border: '#27402F',
  danger: '#F0707F',
  warningBg: '#3A2F14',
  warningText: '#F2C777',
};

export const Radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;

export const Shadow = {
  shadowColor: '#0B2A17',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 4,
} as const;
