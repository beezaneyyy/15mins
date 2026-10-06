import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import type { Category, CourseSummary } from '@/lib/types';
import { plural } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { Badge, Button, Card, Ionicons, MaterialCommunityIcons, ProgressBar, T, type McName } from './ui';

export function CourseIcon({ icon, color, size = 48 }: { icon: string; color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.26,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialCommunityIcons name={icon as McName} size={size * 0.58} color="#FFFFFF" />
    </View>
  );
}

export function CategoryCard({ category }: { category: Category }) {
  const { fs } = useTheme();
  return (
    <Card
      onPress={() => router.push(`/category/${category.id}`)}
      label={`${category.name}, ${plural(category.coursesCount, 'curso', 'cursos')}`}
      style={{ flex: 1, gap: 6, minHeight: 92 }}
    >
      <MaterialCommunityIcons name={category.icon as McName} size={fs(26)} color={category.color} />
      <T size={14} w="700" lines={2}>
        {category.name}
      </T>
      <T size={12} color="muted">
        {plural(category.coursesCount, 'curso', 'cursos')}
      </T>
    </Card>
  );
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const { sp } = useTheme();
  const rows: Category[][] = [];
  for (let i = 0; i < categories.length; i += 2) rows.push(categories.slice(i, i + 2));
  return (
    <View style={{ gap: sp(12) }}>
      {rows.map((row) => (
        <View key={row[0].id} style={{ flexDirection: 'row', gap: sp(12) }}>
          {row.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
          {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
        </View>
      ))}
    </View>
  );
}

function Meta({ icon, text }: { icon: 'time-outline' | 'document-text-outline' | 'star'; text: string }) {
  const { c, fs } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={fs(14)} color={icon === 'star' ? c.star : c.muted} />
      <T size={12} color="muted">
        {text}
      </T>
    </View>
  );
}

export function CourseMetaRow({ course }: { course: CourseSummary }) {
  return (
    <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
      <Meta icon="time-outline" text={`${course.maxLessonMinutes} min`} />
      <Meta icon="document-text-outline" text={plural(course.lessonsCount, 'aula', 'aulas')} />
      <Meta icon="star" text={course.rating.toFixed(1)} />
    </View>
  );
}

const openCourse = (id: string) => router.push(`/course/${id}`);

/** Card grande de "Cursos em destaque" */
export function FeaturedCourseCard({ course }: { course: CourseSummary }) {
  const { sp } = useTheme();
  const started = !!course.progress;
  return (
    <Card style={{ gap: sp(12) }}>
      <Pressable
        onPress={() => openCourse(course.id)}
        accessibilityRole="button"
        accessibilityLabel={`Curso ${course.title}`}
        style={({ pressed }) => ({ flexDirection: 'row', gap: 14, opacity: pressed ? 0.7 : 1 })}
      >
        <CourseIcon icon={course.icon} color={course.color} size={76} />
        <View style={{ flex: 1, gap: 4 }}>
          <Badge text={course.level} />
          <T size={16} w="800">
            {course.title}
          </T>
          <T size={13} color="muted" lines={2}>
            {course.subtitle}
          </T>
        </View>
      </Pressable>
      <CourseMetaRow course={course} />
      {started ? (
        <View style={{ gap: 6 }}>
          <ProgressBar value={course.progress!.percent} height={6} />
          <T size={12} color="muted">
            {course.progress!.percent}% concluído
          </T>
        </View>
      ) : null}
      <Button title={course.progress?.completed ? 'Revisar' : started ? 'Continuar' : 'Começar'} onPress={() => openCourse(course.id)} />
    </Card>
  );
}

/** Linha compacta de curso, usada em listas, busca e salvos */
export function CourseRow({ course, showProgress, right }: { course: CourseSummary; showProgress?: boolean; right?: React.ReactNode }) {
  const { c, sp } = useTheme();
  const p = course.progress;
  return (
    <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
      <Pressable
        onPress={() => openCourse(course.id)}
        accessibilityRole="button"
        accessibilityLabel={`Curso ${course.title}`}
        style={({ pressed }) => ({ flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center', opacity: pressed ? 0.7 : 1 })}
      >
        <CourseIcon icon={course.icon} color={course.color} size={50} />
        <View style={{ flex: 1, gap: sp(4) }}>
          <T size={15} w="700" lines={1}>
            {course.title}
          </T>
          <T size={12} color="muted" lines={1}>
            {course.categoryName} • {course.level}
          </T>
          {showProgress && p ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <View style={{ flex: 1 }}>
                <ProgressBar value={p.percent} height={6} color={p.completed ? c.success : undefined} />
              </View>
              {p.completed ? (
                <Ionicons name="checkmark-circle" size={18} color={c.success} />
              ) : (
                <T size={12} w="700" color="muted">
                  {p.percent}%
                </T>
              )}
            </View>
          ) : (
            <CourseMetaRow course={course} />
          )}
        </View>
      </Pressable>
      {right}
    </Card>
  );
}
