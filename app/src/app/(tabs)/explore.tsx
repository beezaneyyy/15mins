import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { CategoryGrid, CourseRow, FeaturedCourseCard } from '@/components/course';
import { EmptyState, ErrorState, Loading, Screen, SearchInput, SectionTitle, T } from '@/components/ui';
import { api } from '@/lib/api';
import { plural } from '@/lib/format';
import type { CourseSummary } from '@/lib/types';
import { useFetch } from '@/lib/useFetch';
import { useTheme } from '@/theme/ThemeProvider';

export default function Explore() {
  const { sp } = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? '');
  const [lastParam, setLastParam] = useState(params.q);
  const [found, setFound] = useState<{ term: string; list: CourseSummary[] } | null>(null);

  // a Home pode abrir esta aba já com um termo
  if (params.q !== lastParam) {
    setLastParam(params.q);
    if (params.q !== undefined) setQuery(params.q);
  }

  const term = query.trim();
  const searching = !!term && found?.term !== term;
  const results = found?.list ?? null;

  // busca com debounce
  useEffect(() => {
    if (!term) return;
    const t = setTimeout(() => {
      api
        .courses({ q: term })
        .then((list) => setFound({ term, list }))
        .catch(() => setFound({ term, list: [] }));
    }, 300);
    return () => clearTimeout(t);
  }, [term]);

  const { data, error, loading, reload, refresh, refreshing } = useFetch(async () => {
    const [categories, featured] = await Promise.all([api.categories(), api.courses({ featured: true })]);
    return { categories, featured };
  });

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <T size={22} w="800" role="header">
        Explorar cursos
      </T>
      <SearchInput value={query} onChangeText={setQuery} />

      {term ? (
        searching && !results ? (
          <Loading />
        ) : results && results.length ? (
          <View style={{ gap: sp(12) }}>
            <T size={13} color="muted">
              {plural(results.length, 'resultado', 'resultados')} para “{found!.term}”
            </T>
            {results.map((c) => (
              <CourseRow key={c.id} course={c} />
            ))}
          </View>
        ) : (
          <EmptyState icon="text-search" title="Nada encontrado" text="Tente outro termo, como “python”, “design” ou “finanças”." />
        )
      ) : loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <SectionTitle title="Categorias" />
          <CategoryGrid categories={data!.categories} />
          <SectionTitle title="Cursos em destaque" />
          <View style={{ gap: sp(14) }}>
            {data!.featured.map((c) => (
              <FeaturedCourseCard key={c.id} course={c} />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
