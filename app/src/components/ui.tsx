import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/colors';

export type IonName = ComponentProps<typeof Ionicons>['name'];
export type McName = ComponentProps<typeof MaterialCommunityIcons>['name'];
export { Ionicons, MaterialCommunityIcons };

// ---------- Texto ----------

type TProps = {
  children: ReactNode;
  size?: number;
  w?: TextStyle['fontWeight'];
  color?: keyof Palette | (string & {});
  center?: boolean;
  lines?: number;
  style?: StyleProp<TextStyle>;
  role?: 'header';
};

export function T({ children, size = 15, w = '400', color = 'text', center, lines, style, role }: TProps) {
  const { c, fs } = useTheme();
  const resolved = (c as Record<string, string>)[color] ?? color;
  return (
    <Text
      numberOfLines={lines}
      accessibilityRole={role}
      style={[
        { fontSize: fs(size), lineHeight: Math.round(fs(size) * 1.4), fontWeight: w, color: resolved },
        center && { textAlign: 'center' },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ---------- Layout ----------

type ScreenProps = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  onRefresh?: () => void;
  refreshing?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  header,
  footer,
  scroll = true,
  edges = ['top'],
  onRefresh,
  refreshing = false,
  contentStyle,
}: ScreenProps) {
  const { c, sp } = useTheme();
  const padding = { paddingHorizontal: 20, paddingTop: sp(8), paddingBottom: sp(28), gap: sp(20) };
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: c.bg }}>
      {header}
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} colors={[c.primary]} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, padding, contentStyle]}>{children}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

export function Header({ title, right, onBack }: { title?: string; right?: ReactNode; onBack?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 52, gap: 4 }}>
      <IconButton icon="arrow-back" label="Voltar" onPress={onBack ?? goBack} />
      <View style={{ flex: 1 }}>
        {title ? (
          <T size={17} w="700" lines={1} role="header">
            {title}
          </T>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export function Footer({ children }: { children: ReactNode }) {
  const { c, sp } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: sp(12),
        paddingBottom: sp(12),
        borderTopWidth: 1,
        borderTopColor: c.border,
        backgroundColor: c.bg,
      }}
    >
      {children}
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
  label,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  label?: string;
}) {
  const { c, sp } = useTheme();
  const base: ViewStyle = {
    backgroundColor: c.surface,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: sp(14),
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [base, style, pressed && { opacity: 0.7 }]}
    >
      {children}
    </Pressable>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <T size={18} w="800" role="header">
        {title}
      </T>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="link">
          <T size={13} w="600" color="muted">
            {action}
          </T>
        </Pressable>
      ) : null}
    </View>
  );
}

// ---------- Botões ----------

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'success' | 'ghost';
  icon?: IonName;
  iconRight?: IonName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  hint?: string;
};

export function Button({ title, onPress, variant = 'primary', icon, iconRight, loading, disabled, style, hint }: ButtonProps) {
  const { c, sp, fs, settings } = useTheme();
  const palette = {
    primary: { bg: c.primary, fg: c.onPrimary, border: c.primary },
    success: { bg: c.success, fg: '#FFFFFF', border: c.success },
    outline: { bg: c.surface, fg: c.primary, border: c.border },
    ghost: { bg: 'transparent', fg: c.text, border: 'transparent' },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={settings.screenReader ? hint : undefined}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        {
          minHeight: 50,
          paddingVertical: sp(13),
          paddingHorizontal: 18,
          borderRadius: 12,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !settings.reduceMotion ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={fs(18)} color={palette.fg} /> : null}
          <T size={15} w="700" color={palette.fg}>
            {title}
          </T>
          {iconRight ? <Ionicons name={iconRight} size={fs(18)} color={palette.fg} /> : null}
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  color,
  size = 24,
}: {
  icon: IonName;
  label: string;
  onPress?: () => void;
  color?: string;
  size?: number;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => ({ padding: 8, borderRadius: 999, opacity: pressed ? 0.6 : 1 })}
    >
      <Ionicons name={icon} size={size} color={color ?? c.text} />
    </Pressable>
  );
}

// ---------- Progresso / badges ----------

export function ProgressBar({ value, height = 8, color }: { value: number; height?: number; color?: string }) {
  const { c, settings } = useTheme();
  const [anim] = useState(() => new Animated.Value(settings.reduceMotion ? value : 0));
  useEffect(() => {
    if (settings.reduceMotion) anim.setValue(value);
    else
      Animated.timing(anim, {
        toValue: value,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
  }, [value, settings.reduceMotion, anim]);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
      style={{ height, borderRadius: height, backgroundColor: c.track, overflow: 'hidden' }}
    >
      <Animated.View
        style={{
          height: '100%',
          borderRadius: height,
          backgroundColor: color ?? c.primary,
          width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp' }),
        }}
      />
    </View>
  );
}

export function Badge({
  text,
  tone = 'primary',
  icon,
  style,
}: {
  text: string;
  tone?: 'primary' | 'success' | 'neutral';
  icon?: IonName;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const map = {
    primary: { bg: c.primarySoft, fg: c.primary },
    success: { bg: c.successSoft, fg: c.success },
    neutral: { bg: c.surfaceAlt, fg: c.muted },
  }[tone];
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: map.bg,
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderRadius: 999,
        },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={13} color={map.fg} /> : null}
      <T size={12} w="700" color={map.fg}>
        {text}
      </T>
    </View>
  );
}

// ---------- Busca ----------

export function SearchInput({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Buscar cursos ou assuntos...',
  autoFocus,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const { c, fs } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        minHeight: 48,
        borderRadius: 12,
        backgroundColor: c.surfaceAlt,
        borderWidth: 1.5,
        borderColor: focused ? c.primary : c.border,
      }}
    >
      <Ionicons name="search" size={fs(18)} color={c.subtle} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={c.subtle}
        returnKeyType="search"
        autoFocus={autoFocus}
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel="Buscar cursos"
        style={{ flex: 1, fontSize: fs(15), color: c.text, paddingVertical: 10 }}
      />
      {value ? <IconButton icon="close-circle" size={18} label="Limpar busca" color={c.subtle} onPress={() => onChangeText('')} /> : null}
    </View>
  );
}

// ---------- Estados ----------

export function Loading() {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <ActivityIndicator size="large" color={c.primary} />
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }}>
      <MaterialCommunityIcons name="wifi-off" size={44} color="#9AA1AD" />
      <T size={16} w="700" center>
        Não foi possível carregar
      </T>
      <T size={13} color="muted" center>
        {message}. Verifique se o backend está rodando.
      </T>
      {onRetry ? <Button title="Tentar novamente" variant="outline" icon="refresh" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyState({ icon, title, text, action, onAction }: { icon: McName; title: string; text: string; action?: string; onAction?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: 28, gap: 10 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name={icon} size={34} color={c.primary} />
      </View>
      <T size={16} w="700" center>
        {title}
      </T>
      <T size={13} color="muted" center>
        {text}
      </T>
      {action ? <Button title={action} onPress={onAction} style={{ marginTop: 6, alignSelf: 'stretch' }} /> : null}
    </View>
  );
}

/** Entrada animada (escala + fade). Desligada quando "Reduzir animações" está ativo. */
export function Appear({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const { settings } = useTheme();
  const [v] = useState(() => new Animated.Value(settings.reduceMotion ? 1 : 0));
  useEffect(() => {
    if (settings.reduceMotion) return;
    Animated.spring(v, { toValue: 1, delay, friction: 6, tension: 60, useNativeDriver: true }).start();
  }, [v, delay, settings.reduceMotion]);
  return (
    <Animated.View
      style={[
        style,
        { opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}
