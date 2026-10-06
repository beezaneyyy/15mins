import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appear, Badge, Button, ErrorState, Header, Loading, MaterialCommunityIcons, ProgressBar, T } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { useTheme } from '@/theme/ThemeProvider';

export default function Congrats() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c, sp } = useTheme();
  const { data: course, error, loading, reload } = useFetch(() => api.course(id), [id]);

  if (loading) return <Loading />;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.bg }}>
      <Header onBack={() => router.replace(`/course/${id}`)} />
      {error || !course ? (
        <ErrorState message={error ?? 'Curso não encontrado'} onRetry={reload} />
      ) : (
        <View style={{ flex: 1, padding: 20, gap: sp(20), justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', gap: sp(10) }}>
            <Appear>
              <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="trophy" size={72} color={c.star} />
              </View>
            </Appear>
            <T size={28} w="800" center role="header">
              Parabéns!
            </T>
            <T size={14} color="muted" center>
              Você concluiu:
            </T>
            <T size={22} w="800" center>
              {course.title}
            </T>
            <Badge tone="success" icon="checkmark-circle" text={`${course.lessonsCount} aulas concluídas`} style={{ alignSelf: 'center' }} />
          </View>

          <View style={{ gap: 6 }}>
            <ProgressBar value={100} />
            <T size={12} color="muted" center>
              100% do curso concluído
            </T>
          </View>

          <Appear delay={250} style={{ alignItems: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: c.success,
                paddingHorizontal: 22,
                paddingVertical: 10,
                borderRadius: 999,
              }}
            >
              <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
              <T size={15} w="700" color="#FFFFFF">
                Curso concluído
              </T>
            </View>
          </Appear>

          <View style={{ gap: sp(12) }}>
            <Button title="Ver certificado" icon="ribbon-outline" onPress={() => router.push(`/certificate/${id}`)} />
            <Button
              title="Explorar outro curso"
              variant="outline"
              icon="compass-outline"
              onPress={() => {
                router.dismissAll();
                router.navigate('/explore');
              }}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
