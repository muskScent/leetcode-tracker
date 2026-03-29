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
  category: Category | null;
  tags: Tag[];
  notes: string | null;
  timesAttempted: number;
  createdAt: string;
  updatedAt: string;
}

export interface DifficultyStats {
  total: number;
  solved: number;
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
  byCategory: CategoryStats[];
}

export interface CreateProblemDto {
  title: string;
  leetcodeUrl?: string;
  difficulty: Difficulty;
  status?: Status;
  categoryId?: string | null;
  tagIds?: string[];
  notes?: string;
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
