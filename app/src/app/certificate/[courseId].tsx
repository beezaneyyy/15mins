import { useLocalSearchParams } from 'expo-router';
import { Share, View } from 'react-native';
import { CourseIcon } from '@/components/course';
import { Button, ErrorState, Header, Ionicons, Loading, Screen, T } from '@/components/ui';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';
import { useTheme } from '@/theme/ThemeProvider';

export default function CertificateScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { c, sp } = useTheme();
  const { data: cert, error, loading, reload } = useFetch(() => api.certificate(courseId), [courseId]);

  const share = () =>
    cert &&
    Share.share({
      message: `Concluí o curso "${cert.courseTitle}" no 15 Minutos! 🎉 Código do certificado: ${cert.code}`,
    });

  return (
    <Screen header={<Header title="Certificado" />}>
      {loading ? (
        <Loading />
      ) : error || !cert ? (
        <ErrorState message={error ?? 'Certificado não encontrado'} onRetry={reload} />
      ) : (
        <>
          <View
            accessible
            accessibilityLabel={`Certificado de conclusão do curso ${cert.courseTitle}, emitido para ${cert.studentName} em ${formatDate(cert.issuedAt)}`}
            style={{
              borderRadius: 20,
              borderWidth: 2,
              borderColor: c.primary,
              backgroundColor: c.surface,
              padding: 6,
            }}
          >
            <View style={{ borderRadius: 15, borderWidth: 1, borderColor: c.border, padding: sp(22), alignItems: 'center', gap: sp(12) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="time" size={14} color="#FFF" />
                </View>
                <T size={13} w="800">
                  15 Minutos
                </T>
              </View>
              <T size={12} w="700" color="primary" style={{ letterSpacing: 2 }}>
                CERTIFICADO DE CONCLUSÃO
              </T>
              <T size={13} color="muted" center>
                Certificamos que
              </T>
              <T size={26} w="800" center>
                {cert.studentName}
              </T>
              <T size={13} color="muted" center>
                concluiu com êxito o curso
              </T>
              <CourseIcon icon={cert.icon} color={cert.color} size={56} />
              <T size={20} w="800" center>
                {cert.courseTitle}
              </T>
              <T size={13} color="muted" center>
                {cert.categoryName} • {cert.lessonsCount} aulas • {cert.totalMinutes} min
              </T>
              <View style={{ height: 1, alignSelf: 'stretch', backgroundColor: c.border, marginVertical: 4 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' }}>
                <View>
                  <T size={11} color="muted">
                    Emitido em
                  </T>
                  <T size={13} w="700">
                    {formatDate(cert.issuedAt)}
                  </T>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <T size={11} color="muted">
                    Código
                  </T>
                  <T size={13} w="700">
                    {cert.code}
                  </T>
                </View>
              </View>
            </View>
          </View>
          <Button title="Compartilhar" icon="share-social-outline" onPress={share} />
        </>
      )}
    </Screen>
  );
}
