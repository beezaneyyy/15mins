import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type {
  Category,
  CertificateT,
  CompleteResult,
  CourseDetail,
  CourseSummary,
  HistoryItem,
  LessonFull,
  Me,
  MyCourses,
} from './types';

const PORT = 3333;

// Em dispositivo físico usamos o IP da máquina que roda o Metro (hostUri).
// Para apontar para outro servidor: EXPO_PUBLIC_API_URL=http://ip:3333 npx expo start
function resolveBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'web') return `http://localhost:${PORT}`;
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:${PORT}`;
  return Platform.OS === 'android' ? `http://10.0.2.2:${PORT}` : `http://localhost:${PORT}`;
}

export const API_URL = resolveBaseUrl();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Erro ${res.status}`);
  }
  return res.json();
}

const post = <T>(path: string) => request<T>(path, { method: 'POST' });

export const api = {
  categories: () => request<Category[]>('/categories'),
  courses: (params: { q?: string; category?: string; featured?: boolean } = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.category) qs.set('category', params.category);
    if (params.featured) qs.set('featured', 'true');
    const s = qs.toString();
    return request<CourseSummary[]>(`/courses${s ? `?${s}` : ''}`);
  },
  course: (id: string) => request<CourseDetail>(`/courses/${id}`),
  lesson: (id: string, index: number) => request<LessonFull>(`/courses/${id}/lessons/${index}`),
  startCourse: (id: string) => post<CourseDetail>(`/courses/${id}/start`),
  completeLesson: (id: string, index: number) => post<CompleteResult>(`/courses/${id}/lessons/${index}/complete`),
  toggleSave: (id: string) => post<{ saved: boolean }>(`/courses/${id}/save`),
  me: () => request<Me>('/me'),
  myCourses: () => request<MyCourses>('/me/courses'),
  saved: () => request<CourseSummary[]>('/me/saved'),
  certificates: () => request<CertificateT[]>('/me/certificates'),
  certificate: (courseId: string) => request<CertificateT>(`/me/certificates/${courseId}`),
  history: () => request<HistoryItem[]>('/me/history'),
  resetDemo: () => post<{ ok: boolean }>('/dev/reset'),
};
