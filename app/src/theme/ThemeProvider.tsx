import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';
import { getPalette, type Palette } from './colors';

export type Settings = {
  theme: 'system' | 'light' | 'dark';
  textSize: 'small' | 'default' | 'large' | 'xlarge';
  spacing: 'compact' | 'default' | 'wide';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
};

const DEFAULTS: Settings = {
  theme: 'system',
  textSize: 'default',
  spacing: 'default',
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
};

const TEXT_SCALE = { small: 0.9, default: 1, large: 1.15, xlarge: 1.3 } as const;
const SPACE_SCALE = { compact: 0.8, default: 1, wide: 1.25 } as const;
const STORAGE_KEY = '@15min/settings';

type ThemeValue = {
  c: Palette;
  dark: boolean;
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  toggleDark: () => void;
  /** escala uma fonte conforme o tamanho de texto escolhido */
  fs: (size: number) => number;
  /** escala um espaçamento conforme a preferência de espaçamento */
  sp: (size: number) => number;
  ready: boolean;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSettings({ ...DEFAULTS, ...JSON.parse(saved) });
        } else {
          // respeita as preferências do sistema na primeira abertura
          const [reduce, reader] = await Promise.all([
            AccessibilityInfo.isReduceMotionEnabled().catch(() => false),
            AccessibilityInfo.isScreenReaderEnabled().catch(() => false),
          ]);
          setSettings((s) => ({ ...s, reduceMotion: reduce, screenReader: reader }));
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  const setSetting = useCallback<ThemeValue['setSetting']>((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const dark = settings.theme === 'system' ? system === 'dark' : settings.theme === 'dark';

  const value = useMemo<ThemeValue>(() => {
    const ts = TEXT_SCALE[settings.textSize];
    const ss = SPACE_SCALE[settings.spacing];
    return {
      c: getPalette(dark, settings.highContrast),
      dark,
      settings,
      setSetting,
      toggleDark: () => setSetting('theme', dark ? 'light' : 'dark'),
      fs: (n) => Math.round(n * ts),
      sp: (n) => Math.round(n * ss),
      ready,
    };
  }, [dark, settings, setSetting, ready]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return ctx;
}
