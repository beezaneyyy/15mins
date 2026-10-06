import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, ErrorState, Footer, goBack, IconButton, Ionicons, Loading, MaterialCommunityIcons, T, type IonName, type McName } from '@/components/ui';
import { api } from '@/lib/api';
import { plural } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';
import { useTheme } from '@/theme/ThemeProvider';

function Info({ icon, label, value }: { icon: IonName; label?: string; value: string }) {
  const { c, fs } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: '45%', flex: 1 }}>
      <Ionicons name={icon} size={fs(18)} color={icon === 'star' ? c.star : c.muted} />
      <View>
        {label ? (
          <T size={11} color="muted">
            {label}
          </T>
        ) : null}
        <T size={14} w="600">
          {value}
        </T>
      </View>
    </View>
  );
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c, sp, settings } = useTheme();
  const { data: course, setData, error, loading, reload } = useFetch(() => api.course(id), [id]);
  const [starting, setStarting] = useState(false);

  if (loading) return <Loading />;
  if (error || !course)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
        <ErrorState message={error ?? 'Curso não encontrado'} onRetry={reload} />
      </SafeAreaView>
    );

  const p = course.progress;
  const done = new Set(p?.completedLessonIds ?? []);

  const toggleSave = async () => {
    setData({ ...course, saved: !course.saved }); // otimista
    try {
      const r = await api.toggleSave(course.id);
      setData((prev) => prev && { ...prev, saved: r.saved });
    } catch {
      setData((prev) => prev && { ...prev, saved: course.saved });
    }
  };

  const start = async () => {
    if (p?.completed) return router.push(`/course/${course.id}/lesson/0`);
    setStarting(true);
    try {
      const updated = p ? course : await api.startCourse(course.id);
      router.push(`/course/${course.id}/lesson/${updated.progress?.nextLessonIndex ?? 0}`);
    } finally {
      setStarting(false);
    }
  };

  const cta = p?.completed ? 'Revisar curso' : p && p.completedLessons > 0 ? `Continuar • Aula ${(p.nextLessonIndex ?? 0) + 1}` : 'Começar curso';

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: sp(24) }}>
        <View style={{ backgroundColor: course.color, paddingBottom: 36 }}>
          <SafeAreaView edges={['top']}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 4 }}>
              <IconButton icon="arrow-back" label="Voltar" color="#FFF" onPress={goBack} />
              <IconButton
                icon={course.saved ? 'bookmark' : 'bookmark-outline'}
                label={course.saved ? 'Remover dos salvos' : 'Salvar curso'}
                color="#FFF"
                onPress={toggleSave}
              />
            </View>
          </SafeAreaView>
          <View style={{ alignItems: 'center', paddingTop: 4 }}>
            <MaterialCommunityIcons name={course.icon as McName} size={96} color={course.accent} />
          </View>
        </View>

        <View style={{ padding: 20, gap: sp(20), marginTop: -20, backgroundColor: c.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22 }}>
          <View style={{ gap: sp(6) }}>
            <T size={12} w="700" color="primary">
              {course.categoryName.toUpperCase()}
            </T>
            <T size={24} w="800" role="header">
              {course.title}
            </T>
            <T size={14} color="muted">
              {course.subtitle}
            </T>
          </View>

          <Card style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: sp(14), columnGap: 10 }}>
            <Info icon="cellular-outline" value={course.level} />
            <Info icon="time-outline" label="Máximo por aula" value={`${course.maxLessonMinutes} min`} />
            <Info icon="list-outline" value={plural(course.lessonsCount, 'aula', 'aulas')} />
            <Info icon="document-text-outline" value={course.format} />
            <Info icon="star" value={`${course.rating.toFixed(1)} de avaliação`} />
            <Info icon="hourglass-outline" value={`${course.totalMinutes} min no total`} />
          </Card>

          {p ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name={p.completed ? 'checkmark-circle' : 'trending-up'} size={18} color={p.completed ? c.success : c.primary} />
              <T size={13} w="600" color={p.completed ? 'success' : 'primary'}>
                {p.completed ? 'Curso concluído' : `${p.percent}% concluído • ${p.completedLessons} de ${p.totalLessons} aulas`}
              </T>
            </View>
          ) : null}

          <View style={{ gap: sp(10) }}>
            <T size={17} w="800" role="header">
              O que você vai aprender
            </T>
            {course.outcomes.map((o) => (
              <View key={o} style={{ flexDirection: 'row', gap: 10 }}>
                <Ionicons name="checkmark" size={18} color={c.success} />
                <T size={14} style={{ flex: 1 }}>
                  {o}
                </T>
              </View>
            ))}
          </View>

          <View style={{ gap: sp(8) }}>
            <T size={17} w="800" role="header">
              Para quem é este curso?
            </T>
            <T size={14} color="muted">
              {course.audience}
            </T>
          </View>

          <View style={{ gap: sp(10) }}>
            <T size={17} w="800" role="header">
              Conteúdo do curso
            </T>
            <Card style={{ padding: 0 }}>
              {course.lessons.map((l, i) => {
                const isDone = done.has(l.id);
                const isNext = !p?.completed && p?.nextLessonIndex === l.index;
                return (
                  <Pressable
                    key={l.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Aula ${i + 1}: ${l.title}, ${l.minutes} minutos${isDone ? ', concluída' : ''}`}
                    onPress={async () => {
                      if (!p) await api.startCourse(course.id).catch(() => {});
                      router.push(`/course/${course.id}/lesson/${l.index}`);
                    }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: sp(14),
                      borderTopWidth: i ? 1 : 0,
                      borderTopColor: c.border,
                      backgroundColor: isNext ? c.primarySoft : 'transparent',
                      opacity: pressed && !settings.reduceMotion ? 0.6 : 1,
                    })}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isDone ? c.success : isNext ? c.primary : c.surfaceAlt,
                      }}
                    >
                      {isDone ? (
                        <Ionicons name="checkmark" size={16} color="#FFF" />
                      ) : (
                        <T size={12} w="700" color={isNext ? '#FFFFFF' : 'muted'}>
                          {i + 1}
                        </T>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <T size={14} w={isNext ? '700' : '500'} lines={2}>
                        {l.title}
                      </T>
                      <T size={12} color="muted">
                        {l.minutes} min
                      </T>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={c.subtle} />
                  </Pressable>
                );
              })}
            </Card>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: c.bg }}>
        <Footer>
          {p?.completed ? (
            <Button title="Certificado" variant="outline" icon="ribbon-outline" style={{ flex: 1 }} onPress={() => router.push(`/certificate/${course.id}`)} />
          ) : null}
          <Button title={cta} loading={starting} onPress={start} style={{ flex: 1.4 }} />
        </Footer>
      </SafeAreaView>
    </View>
  );
}
