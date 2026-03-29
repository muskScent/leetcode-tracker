import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Problem, Difficulty, Status } from '../problems/problem.entity';
import { Category } from '../categories/category.entity';

export interface DifficultyStats {
  total: number;
  solved: number;
  percent: number;
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Problem)
    private problemRepository: Repository<Problem>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getOverview() {
    const problems = await this.problemRepository.find({
      relations: ['category'],
    });

    const totalProblems = problems.length;
    const totalSolved = problems.filter(
      (p) => p.status === Status.Solved,
    ).length;
    const overallCompletionPercent =
      totalProblems > 0
        ? Math.round((totalSolved / totalProblems) * 100)
        : 0;

    const byDifficulty: Record<string, DifficultyStats> = {};
    for (const diff of Object.values(Difficulty)) {
      const diffProblems = problems.filter((p) => p.difficulty === diff);
      const diffSolved = diffProblems.filter(
        (p) => p.status === Status.Solved,
      ).length;
      byDifficulty[diff] = {
        total: diffProblems.length,
        solved: diffSolved,
        percent:
          diffProblems.length > 0
            ? Math.round((diffSolved / diffProblems.length) * 100)
            : 0,
      };
    }

    const categories = await this.categoryRepository.find({
      relations: ['problems'],
      order: { name: 'ASC' },
    });

    const byCategory = categories.map((cat) => {
      const catProblems = cat.problems ?? [];
      const catSolved = catProblems.filter(
        (p) => p.status === Status.Solved,
      ).length;

      const byDiff: Record<string, DifficultyStats> = {};
      for (const diff of Object.values(Difficulty)) {
        const dp = catProblems.filter((p) => p.difficulty === diff);
        const ds = dp.filter((p) => p.status === Status.Solved).length;
        byDiff[diff] = {
          total: dp.length,
          solved: ds,
          percent:
            dp.length > 0 ? Math.round((ds / dp.length) * 100) : 0,
        };
      }

      return {
        categoryId: cat.id,
        categoryName: cat.name,
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
      byCategory,
    };
  }
}
