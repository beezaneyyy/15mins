import express from 'express';
import cors from 'cors';
import { categories } from './data/categories.js';
import { courses } from './data/courses.js';
import { load, save, reset } from './store.js';

const app = express();
app.use(cors());
app.use(express.json());

// pequeno delay opcional pra simular rede: LATENCY=300 npm start
const LATENCY = Number(process.env.LATENCY || 0);
if (LATENCY) app.use((_req, _res, next) => setTimeout(next, LATENCY));

const byId = new Map(courses.map((c) => [c.id, c]));
const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? id;

const normalize = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function progressOf(course) {
  const enr = load().enrollments[course.id];
  if (!enr) return null;
  const done = new Set(enr.completed);
  const completedCount = course.lessons.filter((l) => done.has(l.id)).length;
  const next = course.lessons.find((l) => !done.has(l.id));
  return {
    completedLessons: completedCount,
    totalLessons: course.lessons.length,
    percent: Math.round((completedCount / course.lessons.length) * 100),
    nextLessonIndex: next ? next.index : null,
    completed: !!enr.completedAt,
    completedAt: enr.completedAt,
    startedAt: enr.startedAt,
    updatedAt: enr.updatedAt,
    completedLessonIds: enr.completed,
  };
}

function summary(course) {
  const minutes = course.lessons.map((l) => l.minutes);
  return {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    category: course.category,
    categoryName: categoryName(course.category),
    level: course.level,
    rating: course.rating,
    icon: course.icon,
    color: course.color,
    accent: course.accent,
    featured: course.featured,
    lessonsCount: course.lessons.length,
    maxLessonMinutes: Math.max(...minutes),
    totalMinutes: minutes.reduce((a, b) => a + b, 0),
    format: 'Texto',
    saved: load().saved.includes(course.id),
    progress: progressOf(course),
  };
}

function detail(course) {
  return {
    ...summary(course),
    audience: course.audience,
    outcomes: course.outcomes,
    lessons: course.lessons.map(({ id, index, title, minutes }) => ({ id, index, title, minutes })),
  };
}

function getCourse(req, res) {
  const course = byId.get(req.params.id);
  if (!course) res.status(404).json({ error: 'Curso não encontrado' });
  return course;
}

function stats() {
  const s = load();
  const enrolled = Object.keys(s.enrollments).map((id) => byId.get(id)).filter(Boolean);
  const progresses = enrolled.map(progressOf);
  const lessonsDone = progresses.reduce((a, p) => a + p.completedLessons, 0);
  const lessonsTotal = progresses.reduce((a, p) => a + p.totalLessons, 0);
  return {
    started: enrolled.length,
    completed: progresses.filter((p) => p.completed).length,
    inProgress: progresses.filter((p) => !p.completed).length,
    saved: s.saved.length,
    lessonsCompleted: lessonsDone,
    overallPercent: lessonsTotal ? Math.round((lessonsDone / lessonsTotal) * 100) : 0,
    minutesStudied: enrolled.reduce((acc, c) => {
      const done = new Set(s.enrollments[c.id].completed);
      return acc + c.lessons.filter((l) => done.has(l.id)).reduce((a, l) => a + l.minutes, 0);
    }, 0),
  };
}

function certificateOf(courseId) {
  const course = byId.get(courseId);
  const enr = load().enrollments[courseId];
  if (!course || !enr?.completedAt) return null;
  return {
    id: `cert-${courseId}`,
    courseId,
    courseTitle: course.title,
    icon: course.icon,
    color: course.color,
    categoryName: categoryName(course.category),
    studentName: load().user.name,
    issuedAt: enr.completedAt,
    lessonsCount: course.lessons.length,
    totalMinutes: course.lessons.reduce((a, l) => a + l.minutes, 0),
    code: `15M-${courseId.replace(/-/g, "").slice(0, 4).toUpperCase()}-${new Date(enr.completedAt).getTime().toString(36).toUpperCase()}`,
  };
}

// ---------- catálogo ----------

app.get('/api/categories', (_req, res) => {
  res.json(categories.map((c) => ({ ...c, coursesCount: courses.filter((k) => k.category === c.id).length })));
});

app.get('/api/courses', (req, res) => {
  const { q, category, featured } = req.query;
  let list = courses;
  if (category) list = list.filter((c) => c.category === category);
  if (featured === 'true') list = list.filter((c) => c.featured);
  if (q) {
    const term = normalize(String(q));
    list = list.filter((c) =>
      [c.title, c.subtitle, categoryName(c.category), ...c.lessons.map((l) => l.title)].some((t) =>
        normalize(t).includes(term),
      ),
    );
  }
  res.json(list.map(summary));
});

app.get('/api/courses/:id', (req, res) => {
  const course = getCourse(req, res);
  if (course) res.json(detail(course));
});

app.get('/api/courses/:id/lessons/:index', (req, res) => {
  const course = getCourse(req, res);
  if (!course) return;
  const lesson = course.lessons[Number(req.params.index)];
  if (!lesson) return res.status(404).json({ error: 'Aula não encontrada' });
  const next = course.lessons[lesson.index + 1];
  res.json({
    ...lesson,
    total: course.lessons.length,
    course: summary(course),
    next: next ? { id: next.id, index: next.index, title: next.title, minutes: next.minutes } : null,
  });
});

// ---------- progresso ----------

app.post('/api/courses/:id/start', (req, res) => {
  const course = getCourse(req, res);
  if (!course) return;
  const s = load();
  if (!s.enrollments[course.id]) {
    const now = new Date().toISOString();
    s.enrollments[course.id] = { startedAt: now, updatedAt: now, completed: [], completedAt: null };
    s.history.push({ type: 'course_started', courseId: course.id, at: now });
    save();
  }
  res.json(detail(course));
});

app.post('/api/courses/:id/lessons/:index/complete', (req, res) => {
  const course = getCourse(req, res);
  if (!course) return;
  const lesson = course.lessons[Number(req.params.index)];
  if (!lesson) return res.status(404).json({ error: 'Aula não encontrada' });

  const s = load();
  const now = new Date().toISOString();
  const enr = (s.enrollments[course.id] ??= { startedAt: now, updatedAt: now, completed: [], completedAt: null });
  let justCompletedCourse = false;

  if (!enr.completed.includes(lesson.id)) {
    enr.completed.push(lesson.id);
    s.history.push({ type: 'lesson_completed', courseId: course.id, lessonId: lesson.id, at: now });
    if (!enr.completedAt && enr.completed.length >= course.lessons.length) {
      enr.completedAt = now;
      justCompletedCourse = true;
      s.history.push({ type: 'course_completed', courseId: course.id, at: now });
    }
  }
  enr.updatedAt = now;
  save();

  const next = course.lessons[lesson.index + 1] ?? null;
  res.json({
    lesson: { id: lesson.id, index: lesson.index, title: lesson.title },
    next: next && { id: next.id, index: next.index, title: next.title, minutes: next.minutes },
    courseCompleted: !!enr.completedAt,
    justCompletedCourse,
    progress: progressOf(course),
    certificate: certificateOf(course.id),
  });
});

app.post('/api/courses/:id/save', (req, res) => {
  const course = getCourse(req, res);
  if (!course) return;
  const s = load();
  const i = s.saved.indexOf(course.id);
  if (i >= 0) s.saved.splice(i, 1);
  else s.saved.unshift(course.id);
  save();
  res.json({ saved: i < 0 });
});

// ---------- usuário ----------

app.get('/api/me', (_req, res) => {
  res.json({ ...load().user, stats: stats() });
});

app.get('/api/me/courses', (_req, res) => {
  const list = Object.keys(load().enrollments)
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map(summary)
    .sort((a, b) => b.progress.updatedAt.localeCompare(a.progress.updatedAt));
  const continueCourse = list.find((c) => !c.progress.completed) ?? null;
  res.json({ continue: continueCourse, courses: list, stats: stats() });
});

app.get('/api/me/saved', (_req, res) => {
  res.json(load().saved.map((id) => byId.get(id)).filter(Boolean).map(summary));
});

app.get('/api/me/certificates', (_req, res) => {
  res.json(
    Object.keys(load().enrollments)
      .map(certificateOf)
      .filter(Boolean)
      .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
  );
});

app.get('/api/me/certificates/:courseId', (req, res) => {
  const cert = certificateOf(req.params.courseId);
  if (!cert) return res.status(404).json({ error: 'Certificado não encontrado' });
  res.json(cert);
});

app.get('/api/me/history', (_req, res) => {
  const items = [...load().history]
    .reverse()
    .map((h) => {
      const course = byId.get(h.courseId);
      if (!course) return null;
      const lesson = h.lessonId ? course.lessons.find((l) => l.id === h.lessonId) : null;
      return {
        ...h,
        courseTitle: course.title,
        icon: course.icon,
        color: course.color,
        lessonTitle: lesson?.title ?? null,
        lessonIndex: lesson?.index ?? null,
      };
    })
    .filter(Boolean);
  res.json(items);
});

app.post('/api/dev/reset', (_req, res) => {
  reset();
  res.json({ ok: true });
});

app.get('/', (_req, res) => res.json({ name: '15 Minutos API', ok: true }));

const PORT = Number(process.env.PORT || 3333);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`15 Minutos API rodando em http://localhost:${PORT}`);
});
