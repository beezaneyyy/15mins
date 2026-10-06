export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  coursesCount: number;
};

export type Progress = {
  completedLessons: number;
  totalLessons: number;
  percent: number;
  nextLessonIndex: number | null;
  completed: boolean;
  completedAt: string | null;
  startedAt: string;
  updatedAt: string;
  completedLessonIds: string[];
};

export type CourseSummary = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  categoryName: string;
  level: string;
  rating: number;
  icon: string;
  color: string;
  accent: string;
  featured: boolean;
  lessonsCount: number;
  maxLessonMinutes: number;
  totalMinutes: number;
  format: string;
  saved: boolean;
  progress: Progress | null;
};

export type LessonMeta = { id: string; index: number; title: string; minutes: number };

export type CourseDetail = CourseSummary & {
  audience: string;
  outcomes: string[];
  lessons: LessonMeta[];
};

export type Block =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; title: string; text: string }
  | { type: 'tip'; text: string }
  | { type: 'summary'; items: string[] };

export type LessonFull = LessonMeta & {
  blocks: Block[];
  total: number;
  course: CourseSummary;
  next: LessonMeta | null;
};

export type CertificateT = {
  id: string;
  courseId: string;
  courseTitle: string;
  icon: string;
  color: string;
  categoryName: string;
  studentName: string;
  issuedAt: string;
  lessonsCount: number;
  totalMinutes: number;
  code: string;
};

export type CompleteResult = {
  lesson: { id: string; index: number; title: string };
  next: LessonMeta | null;
  courseCompleted: boolean;
  justCompletedCourse: boolean;
  progress: Progress;
  certificate: CertificateT | null;
};

export type Stats = {
  started: number;
  completed: number;
  inProgress: number;
  saved: number;
  lessonsCompleted: number;
  overallPercent: number;
  minutesStudied: number;
};

export type Me = { id: string; name: string; email: string; stats: Stats };

export type MyCourses = { continue: CourseSummary | null; courses: CourseSummary[]; stats: Stats };

export type HistoryItem = {
  type: 'course_started' | 'lesson_completed' | 'course_completed';
  courseId: string;
  lessonId?: string;
  at: string;
  courseTitle: string;
  icon: string;
  color: string;
  lessonTitle: string | null;
  lessonIndex: number | null;
};
