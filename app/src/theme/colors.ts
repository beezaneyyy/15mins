export type Palette = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  muted: string;
  subtle: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  success: string;
  successSoft: string;
  star: string;
  codeBg: string;
  codeText: string;
  codeKeyword: string;
  track: string;
  overlay: string;
};

const light: Palette = {
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F6F7F9',
  border: '#ECEDF1',
  text: '#16181D',
  muted: '#5F6673',
  subtle: '#8A919E',
  primary: '#FF6A13',
  primarySoft: '#FFF1E7',
  onPrimary: '#FFFFFF',
  success: '#16A34A',
  successSoft: '#E7F7EE',
  star: '#F59E0B',
  codeBg: '#F4F6FA',
  codeText: '#1F2937',
  codeKeyword: '#2563EB',
  track: '#EDEFF3',
  overlay: 'rgba(15,17,21,0.45)',
};

const dark: Palette = {
  bg: '#0D0F14',
  surface: '#161920',
  surfaceAlt: '#1D2129',
  border: '#272B35',
  text: '#F3F4F6',
  muted: '#A3AAB6',
  subtle: '#7C8492',
  primary: '#FF7424',
  primarySoft: '#2B1B11',
  onPrimary: '#FFFFFF',
  success: '#22C55E',
  successSoft: '#10261A',
  star: '#FBBF24',
  codeBg: '#10131A',
  codeText: '#E5E7EB',
  codeKeyword: '#7AA2FF',
  track: '#2A2F3A',
  overlay: 'rgba(0,0,0,0.6)',
};

// Alto contraste: texto puro, bordas fortes e laranja mais escuro (contraste AA com branco).
const lightHC: Palette = {
  ...light,
  border: '#5F6673',
  text: '#000000',
  muted: '#2B2F36',
  subtle: '#3D434C',
  primary: '#C2410C',
  primarySoft: '#FFE3D1',
  success: '#0F7A35',
  track: '#C9CDD4',
};

const darkHC: Palette = {
  ...dark,
  bg: '#000000',
  surface: '#0B0B0D',
  surfaceAlt: '#141518',
  border: '#9AA1AD',
  text: '#FFFFFF',
  muted: '#E2E5EA',
  subtle: '#C7CCD4',
  primary: '#FF8A3D',
  onPrimary: '#000000',
  track: '#4A505C',
};

export function getPalette(isDark: boolean, highContrast: boolean): Palette {
  if (isDark) return highContrast ? darkHC : dark;
  return highContrast ? lightHC : light;
}
