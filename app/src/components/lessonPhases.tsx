import { View } from 'react-native';
import type { CompleteResult, LessonFull } from '@/lib/types';
import { useTheme } from '@/theme/ThemeProvider';
import { Appear, Button, Card, Ionicons, MaterialCommunityIcons, ProgressBar, T } from './ui';

/** "Você terminou esta aula?" */
export function FinishPhase({
  lesson,
  onConfirm,
  onBack,
  loading,
  error,
}: {
  lesson: LessonFull;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}) {
  const { c, sp } = useTheme();
  const progress = lesson.course.progress;
  return (
    <View style={{ flex: 1, padding: 20, gap: sp(24), justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', gap: sp(12) }}>
        <Appear>
          <MaterialCommunityIcons name="party-popper" size={84} color={c.primary} />
        </Appear>
        <T size={22} w="800" center role="header">
          Você terminou esta aula?
        </T>
        <T size={14} color="muted" center>
          Marque como concluída para continuar seu progresso no curso.
        </T>
      </View>

      <Button title="Marcar como concluída" icon="checkmark" loading={loading} onPress={onConfirm} />
      {error ? (
        <T size={13} color="#E03131" center>
          {error}
        </T>
      ) : null}

      <Card style={{ gap: sp(8) }}>
        <T size={14} w="700">
          Aula {lesson.index + 1} de {lesson.total}
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="time-outline" size={14} color={c.muted} />
          <T size={12} color="muted">
            {lesson.minutes} min
          </T>
        </View>
        <ProgressBar value={progress?.percent ?? 0} />
        <T size={12} color="muted">
          {progress?.percent ?? 0}% concluído
        </T>
      </Card>

      <Button title="Voltar para a aula" variant="ghost" icon="arrow-back" onPress={onBack} />
    </View>
  );
}

/** "Aula concluída!" com a próxima aula */
export function DonePhase({ lesson, result, onContinue }: { lesson: LessonFull; result: CompleteResult; onContinue: () => void }) {
  const { c, sp } = useTheme();
  const next = result.next;
  return (
    <View style={{ flex: 1, padding: 20, gap: sp(24), justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', gap: sp(10) }}>
        <Appear>
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: c.success, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark" size={52} color="#FFF" />
          </View>
        </Appear>
        <T size={24} w="800" center role="header">
          Aula concluída!
        </T>
        <T size={14} color="muted" center>
          Você completou a aula {lesson.index + 1} de {lesson.total}.
        </T>
      </View>

      <View style={{ gap: 6 }}>
        <ProgressBar value={result.progress.percent} color={c.success} />
        <T size={12} color="muted" center>
          {result.progress.percent}% do curso concluído
        </T>
      </View>

      {next ? (
        <Card onPress={onContinue} label={`Próxima aula: ${next.title}`} style={{ gap: sp(8) }}>
          <T size={13} w="700" color="muted">
            Próxima aula
          </T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <T size={16} w="700" style={{ flex: 1 }}>
              {next.title}
            </T>
            <Ionicons name="chevron-forward" size={20} color={c.subtle} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="time-outline" size={14} color={c.muted} />
            <T size={12} color="muted">
              {next.minutes} min
            </T>
          </View>
        </Card>
      ) : (
        <Card style={{ backgroundColor: c.primarySoft, borderColor: c.primarySoft }}>
          <T size={14} center>
            Ainda faltam aulas anteriores para concluir o curso. Volte ao conteúdo para revisar.
          </T>
        </Card>
      )}

      <Button title={next ? 'Continuar' : 'Ver conteúdo do curso'} iconRight="arrow-forward" onPress={onContinue} />

      <T size={13} w="600" color="muted" center>
        Seu progresso está indo muito bem! 🚀
      </T>
    </View>
  );
}
