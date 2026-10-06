import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { CategoryGrid, CourseIcon } from '@/components/course';
import { Button, Card, ErrorState, IconButton, Ionicons, Loading, ProgressBar, Screen, SearchInput, SectionTitle, T } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { useTheme } from '@/theme/ThemeProvider';

export default function Home() {
  const { c, dark, toggleDark, sp } = useTheme();
  const [query, setQuery] = useState('');
  const { data, error, loading, reload, refresh, refreshing } = useFetch(async () => {
    const [categories, mine] = await Promise.all([api.categories(), api.myCourses()]);
    return { categories, continueCourse: mine.continue };
  });

  const search = () => router.push({ pathname: '/explore', params: { q: query.trim() } });
  const cont = data?.continueCourse;

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="time" size={18} color="#FFF" />
          </View>
          <T size={20} w="800">
            15 Minutos
          </T>
        </View>
        <IconButton
          icon={dark ? 'moon' : 'sunny'}
          color={dark ? c.text : c.star}
          label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
          onPress={toggleDark}
        />
      </View>

      <View style={{ gap: sp(8) }}>
        <T size={28} w="800" role="header">
          Aprenda algo novo{'\n'}em até 15 minutos.
        </T>
        <T size={14} color="muted">
          Cursos rápidos em texto para você aprender no seu ritmo, uma pequena etapa por vez.
        </T>
      </View>

      <View style={{ gap: sp(8) }}>
        <SearchInput value={query} onChangeText={setQuery} onSubmit={search} placeholder="O que você quer aprender?" />
        <T size={12} color="subtle">
          Pesquise por cursos ou assuntos.
        </T>
      </View>

      <Button title="Explorar cursos" onPress={() => (query.trim() ? search() : router.push('/explore'))} />

      {cont?.progress ? (
        <Card
          onPress={() => router.push(`/course/${cont.id}/lesson/${cont.progress!.nextLessonIndex ?? 0}`)}
          label={`Continuar ${cont.title}`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.primarySoft, borderColor: c.primarySoft }}
        >
          <CourseIcon icon={cont.icon} color={cont.color} size={44} />
          <View style={{ flex: 1, gap: 6 }}>
            <T size={12} w="700" color="primary">
              CONTINUE DE ONDE PAROU
            </T>
            <T size={15} w="700" lines={1}>
              {cont.title}
            </T>
            <ProgressBar value={cont.progress.percent} height={5} />
          </View>
          <Ionicons name="play-circle" size={36} color={c.primary} />
        </Card>
      ) : null}

      <SectionTitle title="Categorias" action="Ver todas" onAction={() => router.push('/explore')} />
      {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : <CategoryGrid categories={data!.categories} />}
    </Screen>
  );
}
