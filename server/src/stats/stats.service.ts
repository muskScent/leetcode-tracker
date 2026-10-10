import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Problem,
  Difficulty,
  Status,
  Performance,
} from '../problems/problem.entity';
import { Category } from '../categories/category.entity';

export interface DifficultyStats {
  total: number;
  solved: number;
  percent: number;
}

export interface PerformanceStats {
  count: number;
  percent: number;
}

export const UNRATED_PERFORMANCE = 'Unrated';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Problem)
    private problemRepository: Repository<Problem>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getOverview(tagIds?: string[]) {
    const query = this.problemRepository
      .createQueryBuilder('problem')
      .leftJoinAndSelect('problem.category', 'category')
      .leftJoinAndSelect('problem.tags', 'tags');

    if (tagIds && tagIds.length > 0) {
      query.where('tags.id IN (:...tagIds)', { tagIds });
    }

    const problems = await query.getMany();

    const totalProblems = problems.length;
    const totalSolved = problems.filter((p) => p.status === Status.Solved).length;
    const overallCompletionPercent =
      totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

    const byDifficulty: Record<string, DifficultyStats> = {};
    for (const diff of Object.values(Difficulty)) {
      const diffProblems = problems.filter((p) => p.difficulty === diff);
      const diffSolved = diffProblems.filter((p) => p.status === Status.Solved).length;
      byDifficulty[diff] = {
        total: diffProblems.length,
        solved: diffSolved,
        percent:
          diffProblems.length > 0
            ? Math.round((diffSolved / diffProblems.length) * 100)
            : 0,
      };
    }

    // Performance breakdown, measured over solved problems only
    const solvedProblems = problems.filter((p) => p.status === Status.Solved);
    const percentOfSolved = (count: number) =>
      totalSolved > 0 ? Math.round((count / totalSolved) * 100) : 0;

    const byPerformance: Record<string, PerformanceStats> = {};
    for (const perf of Object.values(Performance)) {
      const count = solvedProblems.filter((p) => p.performance === perf).length;
      byPerformance[perf] = { count, percent: percentOfSolved(count) };
    }
    const unratedCount = solvedProblems.filter((p) => !p.performance).length;
    byPerformance[UNRATED_PERFORMANCE] = {
      count: unratedCount,
      percent: percentOfSolved(unratedCount),
    };

    // Build category map from filtered problems
    const categoryMap = new Map<string, { name: string; problems: Problem[] }>();

    // When unfiltered, include all categories (even empty ones)
    if (!tagIds || tagIds.length === 0) {
      const allCategories = await this.categoryRepository.find({ order: { name: 'ASC' } });
      for (const cat of allCategories) {
        categoryMap.set(cat.id, { name: cat.name, problems: [] });
      }
    }

    for (const p of problems) {
      if (p.category) {
        if (!categoryMap.has(p.category.id)) {
          categoryMap.set(p.category.id, { name: p.category.name, problems: [] });
        }
        categoryMap.get(p.category.id)!.problems.push(p);
      }
    }

    const byCategory = [...categoryMap.entries()]
      .sort(([, a], [, b]) => a.name.localeCompare(b.name))
      .map(([id, { name, problems: catProblems }]) => {
        const catSolved = catProblems.filter((p) => p.status === Status.Solved).length;
        const byDiff: Record<string, DifficultyStats> = {};
        for (const diff of Object.values(Difficulty)) {
          const dp = catProblems.filter((p) => p.difficulty === diff);
          const ds = dp.filter((p) => p.status === Status.Solved).length;
          byDiff[diff] = {
            total: dp.length,
            solved: ds,
            percent: dp.length > 0 ? Math.round((ds / dp.length) * 100) : 0,
          };
        }
        return {
          categoryId: id,
          categoryName: name,
          total: catProblems.length,
          solved: catSolved,
          percent:
            catProblems.length > 0
              ? Math.round((catSolved / catProblems.length) * 100)
              : 0,
          byDifficulty: byDiff,
        };
      });

    return {
      totalProblems,
      totalSolved,
      overallCompletionPercent,
      byDifficulty,
      byPerformance,
      byCategory,
    };
  }
}
