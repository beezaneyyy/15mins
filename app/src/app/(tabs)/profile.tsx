import { router, type Href } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, Modal, Platform, Pressable, Switch, View } from 'react-native';
import { Card, ErrorState, Ionicons, Loading, ProgressBar, Screen, T, type IonName } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { useTheme, type Settings } from '@/theme/ThemeProvider';

type Option<V> = { value: V; label: string };

const THEME_OPTS: Option<Settings['theme']>[] = [
  { value: 'system', label: 'Automático (sistema)' },
  { value: 'light', label: 'Modo claro' },
  { value: 'dark', label: 'Modo escuro' },
];
const TEXT_OPTS: Option<Settings['textSize']>[] = [
  { value: 'small', label: 'Pequeno' },
  { value: 'default', label: 'Padrão' },
  { value: 'large', label: 'Grande' },
  { value: 'xlarge', label: 'Muito grande' },
];
const SPACING_OPTS: Option<Settings['spacing']>[] = [
  { value: 'compact', label: 'Compacto' },
  { value: 'default', label: 'Padrão' },
  { value: 'wide', label: 'Amplo' },
];

function Row({ icon, label, children, onPress }: { icon?: IonName; label: string; children?: ReactNode; onPress?: () => void }) {
  const { c, sp, fs } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: sp(12),
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {icon ? <Ionicons name={icon} size={fs(20)} color={c.muted} /> : null}
      <View style={{ flex: 1 }}>
        <T size={14}>{label}</T>
      </View>
      {children}
    </Pressable>
  );
}

function LinkRow({ icon, label, href }: { icon: IonName; label: string; href: Href }) {
  const { c } = useTheme();
  return (
    <Row icon={icon} label={label} onPress={() => router.push(href)}>
      <Ionicons name="chevron-forward" size={18} color={c.subtle} />
    </Row>
  );
}

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const { c } = useTheme();
  return (
    <Row label={label}>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ true: c.primary, false: c.track }}
        thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
      />
    </Row>
  );
}

function SelectRow<V extends string>({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon?: IonName;
  label: string;
  value: V;
  options: Option<V>[];
  onChange: (v: V) => void;
}) {
  const { c, sp } = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label;
  return (
    <>
      <Row icon={icon} label={label} onPress={() => setOpen(true)}>
        <T size={13} color="muted">
          {current}
        </T>
        <Ionicons name="chevron-down" size={16} color={c.subtle} />
      </Row>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' }} onPress={() => setOpen(false)}>
          <Pressable style={{ backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36, gap: sp(6) }}>
            <T size={17} w="800" style={{ marginBottom: 8 }}>
              {label}
            </T>
            {options.map((o) => {
              const selected = o.value === value;
              return (
                <Pressable
                  key={o.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: sp(14),
                    borderRadius: 12,
                    backgroundColor: selected ? c.primarySoft : c.surfaceAlt,
                  }}
                >
                  <T size={15} w={selected ? '700' : '400'} color={selected ? 'primary' : 'text'}>
                    {o.label}
                  </T>
                  {selected ? <Ionicons name="checkmark" size={20} color={c.primary} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <T size={15} w="800" role="header">
        {title}
      </T>
      <Card style={{ paddingVertical: 2 }}>
        <View style={{ gap: 0 }}>
          {Array.isArray(children)
            ? children.map((child, i) => (
                <View key={i} style={i > 0 ? { borderTopWidth: 1, borderTopColor: c.border } : undefined}>
                  {child}
                </View>
              ))
            : children}
        </View>
      </Card>
    </View>
  );
}

export default function Profile() {
  const { c, sp, settings, setSetting } = useTheme();
  const { data: me, error, loading, reload } = useFetch(api.me);

  const resetDemo = () => {
    const run = () => api.resetDemo().then(reload);
    if (Platform.OS === 'web') return run();
    Alert.alert('Restaurar dados de demonstração?', 'Seu progresso, salvos e certificados voltarão ao estado inicial.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Restaurar', style: 'destructive', onPress: run },
    ]);
  };

  return (
    <Screen>
      <T size={22} w="800" role="header">
        Meu perfil
      </T>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <Card style={{ gap: sp(14) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
              <T size={24} w="800" color={c.onPrimary}>
                {me!.name[0]}
              </T>
            </View>
            <View style={{ gap: 2 }}>
              <T size={18} w="800">
                {me!.name}
              </T>
              <T size={13} color="muted">
                {me!.email}
              </T>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {[
              ['Cursos iniciados', me!.stats.started],
              ['Cursos concluídos', me!.stats.completed],
              ['Progresso geral', `${me!.stats.overallPercent}%`],
            ].map(([label, value]) => (
              <View key={label} style={{ flex: 1, gap: 2 }}>
                <T size={11} color="muted">
                  {label}
                </T>
                <T size={20} w="800">
                  {value}
                </T>
              </View>
            ))}
          </View>
          <ProgressBar value={me!.stats.overallPercent} />
          <T size={12} color="muted">
            {me!.stats.lessonsCompleted} aulas concluídas • {me!.stats.minutesStudied} min de estudo
          </T>
        </Card>
      )}

      <Group title="Atalhos">
        <LinkRow icon="ribbon-outline" label="Meus certificados" href="/certificates" />
        <LinkRow icon="bookmark-outline" label="Cursos salvos" href="/saved" />
        <LinkRow icon="time-outline" label="Histórico de aprendizado" href="/history" />
      </Group>

      <Group title="Aparência">
        <SelectRow icon="contrast-outline" label="Tema" value={settings.theme} options={THEME_OPTS} onChange={(v) => setSetting('theme', v)} />
      </Group>

      <Group title="Acessibilidade">
        <SelectRow label="Tamanho do texto" value={settings.textSize} options={TEXT_OPTS} onChange={(v) => setSetting('textSize', v)} />
        <SwitchRow label="Alto contraste" value={settings.highContrast} onChange={(v) => setSetting('highContrast', v)} />
        <SelectRow label="Espaçamento entre elementos" value={settings.spacing} options={SPACING_OPTS} onChange={(v) => setSetting('spacing', v)} />
        <SwitchRow label="Reduzir animações" value={settings.reduceMotion} onChange={(v) => setSetting('reduceMotion', v)} />
        <SwitchRow label="Compatibilidade com leitor de tela" value={settings.screenReader} onChange={(v) => setSetting('screenReader', v)} />
      </Group>

      <Group title="Demonstração">
        <Row icon="refresh-outline" label="Restaurar dados de demonstração" onPress={resetDemo} />
      </Group>

      <T size={12} color="subtle" center>
        15 Minutos • v1.0.0
      </T>
    </Screen>
  );
}
