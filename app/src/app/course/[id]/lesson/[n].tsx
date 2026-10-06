import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DonePhase, FinishPhase } from '@/components/lessonPhases';
import { Button, Card, ErrorState, Footer, goBack, Header, Ionicons, Loading, ProgressBar, T } from '@/components/ui';
import { api } from '@/lib/api';
import type { Block, CompleteResult } from '@/lib/types';
import { useFetch } from '@/lib/useFetch';
import { useTheme } from '@/theme/ThemeProvider';

const KEYWORDS = /\b(def|return|print|if|elif|else|for|while|in|import|from|class|const|let|function|public|static|void|new|interface|implements|SELECT|FROM|WHERE|AND|OR|JOIN|ON|GROUP BY|AS|git)\b/g;

function CodeLine({ line }: { line: string }) {
  const { c, fs } = useTheme();
  const [codePart, ...commentParts] = line.split(/(?=#\s|\/\/\s)/);
  const pieces = codePart.split(KEYWORDS);
  const style = { fontFamily: 'monospace', fontSize: fs(13), lineHeight: fs(20) };
  return (
    <T size={13} style={style}>
      {pieces.map((piece, i) =>
        i % 2 === 1 ? (
          <T key={i} size={13} w="700" color={c.codeKeyword} style={style}>
            {piece}
          </T>
        ) : (
          <T key={i} size={13} color={c.codeText} style={style}>
            {piece}
          </T>
        ),
      )}
      {commentParts.length ? (
        <T size={13} color="subtle" style={style}>
          {commentParts.join('')}
        </T>
      ) : null}
    </T>
  );
}

function BlockView({ block }: { block: Block }) {
  const { c, sp } = useTheme();
  switch (block.type) {
    case 'heading':
      return (
        <T size={20} w="800" role="header">
          {block.text}
        </T>
      );
    case 'paragraph':
      return (
        <T size={15} color="muted" style={{ lineHeight: undefined }}>
          {block.text}
        </T>
      );
    case 'code':
      return (
        <View style={{ borderRadius: 12, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: c.primarySoft }}>
            <Ionicons name="bulb-outline" size={16} color={c.primary} />
            <T size={13} w="700" color="primary">
              {block.title}
            </T>
          </View>
          <ScrollView horizontal style={{ backgroundColor: c.codeBg }} contentContainerStyle={{ padding: sp(14) }}>
            <View accessible accessibilityLabel={`Código: ${block.text}`}>
              {block.text.split('\n').map((line, i) => (
                <CodeLine key={i} line={line || ' '} />
              ))}
            </View>
          </ScrollView>
        </View>
      );
    case 'tip':
      return (
        <View style={{ flexDirection: 'row', gap: 10, padding: sp(14), borderRadius: 12, backgroundColor: c.successSoft }}>
          <Ionicons name="sparkles-outline" size={18} color={c.success} />
          <T size={14} style={{ flex: 1 }}>
            {block.text}
          </T>
        </View>
      );
    case 'summary':
      return (
        <Card style={{ gap: sp(8), backgroundColor: c.surfaceAlt }}>
          <T size={16} w="800" role="header">
            Resumo
          </T>
          {block.items.map((item) => (
            <View key={item} style={{ flexDirection: 'row', gap: 8 }}>
              <T size={14} color="primary" w="800">
                •
              </T>
              <T size={14} style={{ flex: 1 }}>
                {item}
              </T>
            </View>
          ))}
        </Card>
      );
  }
}

export default function LessonScreen() {
  const { id, n } = useLocalSearchParams<{ id: string; n: string }>();
  const index = Number(n);
  const { c, sp } = useTheme();
  const scroll = useRef<ScrollView>(null);
  const { data: lesson, error, loading, reload } = useFetch(() => api.lesson(id, index), [id, index]);
  // a aula tem 3 fases: leitura → "terminou?" → "aula concluída"
  const [phase, setPhase] = useState<'read' | 'finish' | 'done'>('read');
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [index]);

  if (loading) return <Loading />;
  if (error || !lesson)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
        <Header />
        <ErrorState message={error ?? 'Aula não encontrada'} onRetry={reload} />
      </SafeAreaView>
    );

  const progress = lesson.course.progress;
  const isDone = progress?.completedLessonIds.includes(lesson.id) ?? false;

  const goPrev = () => {
    if (index > 0) router.replace(`/course/${id}/lesson/${index - 1}`);
    else goBack();
  };

  const goNext = () => {
    if (!isDone) return setPhase('finish');
    // aula já concluída: segue direto
    if (lesson.next) router.replace(`/course/${id}/lesson/${lesson.next.index}`);
    else if (progress?.completed) router.replace(`/course/${id}/congrats`);
    else setPhase('finish');
  };

  const complete = async () => {
    setCompleting(true);
    setCompleteError(null);
    try {
      const r = await api.completeLesson(id, index);
      if (r.courseCompleted && (r.justCompletedCourse || !r.next)) {
        router.replace(`/course/${id}/congrats`);
        return;
      }
      setResult(r);
      setPhase('done');
    } catch (e) {
      setCompleteError(e instanceof Error ? e.message : 'Não foi possível salvar');
    } finally {
      setCompleting(false);
    }
  };

  const continueAfterDone = () => {
    const next = result?.next;
    if (next) router.replace(`/course/${id}/lesson/${next.index}`);
    else router.replace(`/course/${id}`);
  };

  if (phase !== 'read')
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.bg }}>
        {phase === 'finish' ? (
          <>
            <Header title={lesson.course.title} onBack={() => setPhase('read')} />
            <FinishPhase lesson={lesson} onConfirm={complete} onBack={() => setPhase('read')} loading={completing} error={completeError} />
          </>
        ) : (
          <>
            <Header title={lesson.course.title} onBack={goBack} />
            <DonePhase lesson={lesson} result={result!} onContinue={continueAfterDone} />
          </>
        )}
      </SafeAreaView>
    );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title={lesson.course.title} />
      <ScrollView ref={scroll} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: sp(28), gap: sp(18) }}>
        <View style={{ gap: sp(8) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T size={14} w="700">
              Aula {index + 1} de {lesson.total}
            </T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="time-outline" size={15} color={c.muted} />
              <T size={13} color="muted">
                {lesson.minutes} min
              </T>
            </View>
          </View>
          <ProgressBar value={progress?.percent ?? 0} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T size={12} color="muted">
              {progress?.percent ?? 0}% concluído
            </T>
            {isDone ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="checkmark-circle" size={14} color={c.success} />
                <T size={12} w="600" color="success">
                  Aula concluída
                </T>
              </View>
            ) : null}
          </View>
        </View>

        {lesson.blocks.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
      </ScrollView>
      <Footer>
        <Button title="Voltar" variant="outline" icon="arrow-back" style={{ flex: 1 }} onPress={goPrev} />
        <Button title="Próximo" iconRight="arrow-forward" style={{ flex: 1 }} onPress={goNext} />
      </Footer>
    </SafeAreaView>
  );
}
