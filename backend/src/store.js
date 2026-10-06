// Persistência simples em arquivo JSON (um único usuário mockado).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data.json');

const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();

function seed() {
  return {
    user: { id: 'u1', name: 'Caique', email: 'caique@email.com' },
    saved: ['python-do-zero', 'ui-ux-design', 'marketing-digital', 'git-e-github'],
    enrollments: {
      'python-do-zero': {
        startedAt: daysAgo(6),
        updatedAt: daysAgo(0.2),
        completed: ['python-do-zero-1', 'python-do-zero-2'],
        completedAt: null,
      },
      'javascript-essencial': {
        startedAt: daysAgo(4),
        updatedAt: daysAgo(2),
        completed: ['javascript-essencial-1'],
        completedAt: null,
      },
      'git-e-github': {
        startedAt: daysAgo(15),
        updatedAt: daysAgo(10),
        completed: ['git-e-github-1', 'git-e-github-2', 'git-e-github-3'],
        completedAt: daysAgo(10),
      },
    },
    history: [
      { type: 'course_completed', courseId: 'git-e-github', at: daysAgo(10) },
      { type: 'lesson_completed', courseId: 'javascript-essencial', lessonId: 'javascript-essencial-1', at: daysAgo(2) },
      { type: 'lesson_completed', courseId: 'python-do-zero', lessonId: 'python-do-zero-1', at: daysAgo(1) },
      { type: 'lesson_completed', courseId: 'python-do-zero', lessonId: 'python-do-zero-2', at: daysAgo(0.2) },
    ],
  };
}

let state;

export function load() {
  if (!state) {
    try {
      state = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    } catch {
      state = seed();
      save();
    }
  }
  return state;
}

export function save() {
  fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
}

export function reset() {
  state = seed();
  save();
  return state;
}
