export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export enum Status {
  Unsolved = 'Unsolved',
  Attempted = 'Attempted',
  Solved = 'Solved',
}

export enum Performance {
  Good = 'Good',
  Average = 'Average',
  Bad = 'Bad',
}

export interface Category {
  id: string;
  name: string;
  totalProblems?: number;
  solvedProblems?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Problem {
  id: string;
  title: string;
  leetcodeUrl: string | null;
  difficulty: Difficulty;
  status: Status;
  performance: Performance | null;
  category: Category | null;
  tags: Tag[];
  keyTechniques: string | null;
  performanceComment: string | null;
  timesAttempted: number;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
  reviewInterval: number;
  createdAt: string;
  updatedAt: string;
}

export interface DifficultyStats {
  total: number;
  solved: number;
  percent: number;
}

export interface PerformanceStats {
  count: number;
  percent: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  total: number;
  solved: number;
  percent: number;
  byDifficulty: Record<string, DifficultyStats>;
}

export interface StatsOverview {
  totalProblems: number;
  totalSolved: number;
  overallCompletionPercent: number;
  byDifficulty: Record<string, DifficultyStats>;
  /** Share of solved problems per performance rating, plus an `Unrated` bucket. */
  byPerformance: Record<string, PerformanceStats>;
  byCategory: CategoryStats[];
}

export interface CreateProblemDto {
  title: string;
  leetcodeUrl?: string;
  difficulty: Difficulty;
  status?: Status;
  performance?: Performance | null;
  categoryId?: string | null;
  tagIds?: string[];
  keyTechniques?: string;
  performanceComment?: string;
  timesAttempted?: number;
}

export type UpdateProblemDto = Partial<CreateProblemDto>;

export interface FilterProblemsParams {
  category?: string;
  difficulty?: Difficulty;
  status?: Status;
  tag?: string;
  search?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title: string;
  content?: string;
  tagIds?: string[];
}

export type UpdateNoteDto = Partial<CreateNoteDto>;

export interface FilterNotesParams {
  tag?: string;
  search?: string;
}
