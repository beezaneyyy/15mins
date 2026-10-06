import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { CourseRow } from '@/components/course';
import { EmptyState, ErrorState, Header, Loading, Screen, T } from '@/components/ui';
import { api } from '@/lib/api';
import { plural } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';
import { useTheme } from '@/theme/ThemeProvider';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sp } = useTheme();
  const { data, error, loading, reload, refresh, refreshing } = useFetch(async () => {
    const [categories, courses] = await Promise.all([api.categories(), api.courses({ category: id })]);
    return { category: categories.find((c) => c.id === id), courses };
  }, [id]);

  return (
    <Screen header={<Header title={data?.category?.name ?? 'Categoria'} />} onRefresh={refresh} refreshing={refreshing}>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data!.courses.length ? (
        <EmptyState icon="book-off-outline" title="Sem cursos por aqui" text="Novos cursos chegam em breve." />
      ) : (
        <View style={{ gap: sp(12) }}>
          <T size={13} color="muted">
            {plural(data!.courses.length, 'curso disponível', 'cursos disponíveis')}
          </T>
          {data!.courses.map((c) => (
            <CourseRow key={c.id} course={c} showProgress={!!c.progress} />
          ))}
        </View>
      )}
    </Screen>
  );
}
