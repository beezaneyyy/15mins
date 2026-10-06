import { router } from 'expo-router';
import { View } from 'react-native';
import { CourseRow } from '@/components/course';
import { EmptyState, ErrorState, Header, IconButton, Loading, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { useTheme } from '@/theme/ThemeProvider';

export default function Saved() {
  const { c, sp } = useTheme();
  const { data, setData, error, loading, reload, refresh, refreshing } = useFetch(api.saved);

  const unsave = async (id: string) => {
    const before = data;
    setData((list) => list?.filter((c) => c.id !== id) ?? null);
    try {
      await api.toggleSave(id);
    } catch {
      setData(before);
    }
  };

  return (
    <Screen header={<Header title="Cursos salvos" />} onRefresh={refresh} refreshing={refreshing}>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data!.length ? (
        <EmptyState
          icon="bookmark-outline"
          title="Nenhum curso salvo"
          text="Toque no marcador de um curso para guardá-lo aqui."
          action="Explorar cursos"
          onAction={() => router.navigate('/explore')}
        />
      ) : (
        <View style={{ gap: sp(10) }}>
          {data!.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              showProgress={!!course.progress}
              right={<IconButton icon="bookmark" color={c.primary} label={`Remover ${course.title} dos salvos`} onPress={() => unsave(course.id)} />}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
