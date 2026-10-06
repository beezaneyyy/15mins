import { router } from 'expo-router';
import { View } from 'react-native';
import { CourseIcon } from '@/components/course';
import { Card, EmptyState, ErrorState, Header, Loading, Screen, T } from '@/components/ui';
import { api } from '@/lib/api';
import { relativeTime } from '@/lib/format';
import type { HistoryItem } from '@/lib/types';
import { useFetch } from '@/lib/useFetch';
import { useTheme } from '@/theme/ThemeProvider';

function describe(item: HistoryItem) {
  switch (item.type) {
    case 'course_started':
      return { title: 'Começou o curso', detail: item.courseTitle };
    case 'course_completed':
      return { title: 'Concluiu o curso 🏆', detail: item.courseTitle };
    case 'lesson_completed':
      return { title: `Concluiu a aula ${(item.lessonIndex ?? 0) + 1}`, detail: `${item.lessonTitle} • ${item.courseTitle}` };
  }
}

export default function History() {
  const { sp } = useTheme();
  const { data, error, loading, reload, refresh, refreshing } = useFetch(api.history);

  return (
    <Screen header={<Header title="Histórico de aprendizado" />} onRefresh={refresh} refreshing={refreshing}>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data!.length ? (
        <EmptyState icon="history" title="Nada por aqui ainda" text="Suas aulas concluídas aparecerão aqui." />
      ) : (
        <View style={{ gap: sp(10) }}>
          {data!.map((item, i) => {
            const d = describe(item);
            return (
              <Card
                key={`${item.at}-${i}`}
                onPress={() => router.push(`/course/${item.courseId}`)}
                label={`${d.title}: ${d.detail}, ${relativeTime(item.at)}`}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <CourseIcon icon={item.icon} color={item.color} size={40} />
                <View style={{ flex: 1, gap: 2 }}>
                  <T size={14} w="700">
                    {d.title}
                  </T>
                  <T size={12} color="muted" lines={2}>
                    {d.detail}
                  </T>
                </View>
                <T size={11} color="subtle">
                  {relativeTime(item.at)}
                </T>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
