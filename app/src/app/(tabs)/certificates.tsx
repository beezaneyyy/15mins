import { router } from 'expo-router';
import { View } from 'react-native';
import { CourseIcon } from '@/components/course';
import { Card, EmptyState, ErrorState, Ionicons, Loading, Screen, T } from '@/components/ui';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';
import { useTheme } from '@/theme/ThemeProvider';

export default function Certificates() {
  const { c, sp } = useTheme();
  const { data, error, loading, reload, refresh, refreshing } = useFetch(api.certificates);

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <View style={{ gap: 4 }}>
        <T size={22} w="800" role="header">
          Certificados
        </T>
        <T size={14} color="muted">
          Suas conquistas em um só lugar.
        </T>
      </View>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data!.length ? (
        <EmptyState
          icon="certificate-outline"
          title="Nenhum certificado ainda"
          text="Conclua todas as aulas de um curso para receber seu certificado."
          action="Ver meus cursos"
          onAction={() => router.push('/my-courses')}
        />
      ) : (
        <View style={{ gap: sp(12) }}>
          {data!.map((cert) => (
            <Card
              key={cert.id}
              onPress={() => router.push(`/certificate/${cert.courseId}`)}
              label={`Certificado de ${cert.courseTitle}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <CourseIcon icon={cert.icon} color={cert.color} size={50} />
              <View style={{ flex: 1, gap: 2 }}>
                <T size={15} w="700">
                  {cert.courseTitle}
                </T>
                <T size={12} color="muted">
                  Emitido em {formatDate(cert.issuedAt)}
                </T>
              </View>
              <Ionicons name="ribbon" size={24} color={c.primary} />
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
