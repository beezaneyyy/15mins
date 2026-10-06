import { router } from 'expo-router';
import { View } from 'react-native';
import { CourseIcon, CourseRow } from '@/components/course';
import { Button, Card, EmptyState, ErrorState, Loading, ProgressBar, Screen, SectionTitle, T } from '@/components/ui';
import { api } from '@/lib/api';
import { plural } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';
import { useTheme } from '@/theme/ThemeProvider';

function Stat({ label, value, onPress }: { label: string; value: number; onPress?: () => void }) {
  return (
    <Card onPress={onPress} label={`${label}: ${value}`} style={{ flex: 1, gap: 6 }}>
      <T size={12} color="muted">
        {label}
      </T>
      <T size={22} w="800">
        {value}
      </T>
    </Card>
  );
}

export default function MyCourses() {
  const { sp } = useTheme();
  const { data: me } = useFetch(api.me);
  const { data, error, loading, reload, refresh, refreshing } = useFetch(api.myCourses);

  const cont = data?.continue;
  const remaining = cont?.progress ? cont.progress.totalLessons - cont.progress.completedLessons : 0;

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <View style={{ gap: 4 }}>
        <T size={24} w="800" role="header">
          Olá, {me?.name ?? '...'} 👋
        </T>
        <T size={14} color="muted">
          Continue de onde parou.
        </T>
      </View>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data!.courses.length ? (
        <EmptyState
          icon="book-open-page-variant-outline"
          title="Você ainda não começou nenhum curso"
          text="Escolha um assunto e aprenda em aulas de até 15 minutos."
          action="Explorar cursos"
          onAction={() => router.push('/explore')}
        />
      ) : (
        <>
          {cont?.progress ? (
            <Card style={{ gap: sp(12) }}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <CourseIcon icon={cont.icon} color={cont.color} size={56} />
                <View style={{ flex: 1, gap: 2 }}>
                  <T size={16} w="800">
                    {cont.title}
                  </T>
                  <T size={13} color="muted">
                    {cont.progress.percent}% concluído
                  </T>
                </View>
              </View>
              <ProgressBar value={cont.progress.percent} />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <T size={13} color="muted">
                  {plural(remaining, 'aula restante', 'aulas restantes')}
                </T>
                <Button
                  title="Continuar"
                  iconRight="arrow-forward"
                  style={{ minHeight: 42, paddingVertical: 8 }}
                  onPress={() => router.push(`/course/${cont.id}/lesson/${cont.progress!.nextLessonIndex ?? 0}`)}
                />
              </View>
            </Card>
          ) : null}

          <SectionTitle title="Meus cursos" />
          <View style={{ gap: sp(10) }}>
            {data!.courses.map((c) => (
              <CourseRow key={c.id} course={c} showProgress />
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: sp(10) }}>
            <Stat label="Em andamento" value={data!.stats.inProgress} />
            <Stat label="Concluídos" value={data!.stats.completed} onPress={() => router.push('/certificates')} />
            <Stat label="Salvos" value={data!.stats.saved} onPress={() => router.push('/saved')} />
          </View>
        </>
      )}
    </Screen>
  );
}
