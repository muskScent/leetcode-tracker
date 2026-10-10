import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { Performance, Problem } from './problem.entity';
import { Tag } from '../tags/tag.entity';
import { Category } from '../categories/category.entity';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { FilterProblemsDto } from './dto/filter-problems.dto';
import { UndoReviewDto } from '../reviews/dto/undo-review.dto';

const MAX_INTERVAL_DAYS = 60;

function addDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function nextInterval(current: number, performance: Performance): number {
  if (performance === Performance.Bad) return 1;
  if (performance === Performance.Average) {
    const grown = current > 0 ? Math.ceil(current * 1.5) : 3;
    return Math.min(MAX_INTERVAL_DAYS, Math.max(3, grown));
  }
  return 0;
}

@Injectable()
export class ProblemsService {
  constructor(
    @InjectRepository(Problem)
    private problemRepository: Repository<Problem>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async findAll(filters: FilterProblemsDto): Promise<Problem[]> {
    const query = this.problemRepository
      .createQueryBuilder('problem')
      .leftJoinAndSelect('problem.category', 'category')
      .leftJoinAndSelect('problem.tags', 'tags');

    if (filters.category) {
      query.andWhere('LOWER(category.name) = LOWER(:category)', {
        category: filters.category,
      });
    }
    if (filters.difficulty) {
      query.andWhere('problem.difficulty = :difficulty', {
        difficulty: filters.difficulty,
      });
    }
    if (filters.status) {
      query.andWhere('problem.status = :status', { status: filters.status });
    }
    if (filters.tag) {
      // Join a second time so the selected `tags` relation still returns every
      // tag of a matching problem, not just the one being filtered on.
      query.innerJoin(
        'problem.tags',
        'filterTag',
        'LOWER(filterTag.name) = LOWER(:tag)',
        { tag: filters.tag },
      );
    }
    if (filters.search) {
      query.andWhere('LOWER(problem.title) LIKE LOWER(:search)', {
        search: `%${filters.search}%`,
      });
    }

    return query.orderBy('problem.updatedAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Problem> {
    const problem = await this.problemRepository.findOne({
      where: { id },
      relations: ['category', 'tags'],
    });
    if (!problem) throw new NotFoundException(`Problem ${id} not found`);
    return problem;
  }

  async create(dto: CreateProblemDto): Promise<Problem> {
    const { tagIds, categoryId, ...rest } = dto;
    const problem = this.problemRepository.create(rest as Partial<Problem>);

    if (categoryId) {
      problem.category = { id: categoryId } as Category;
    }

    if (tagIds && tagIds.length > 0) {
      problem.tags = await this.tagRepository.findBy({ id: In(tagIds) });
    } else {
      problem.tags = [];
    }

    this.applySchedule(problem, problem.performance ?? null);

    return this.problemRepository.save(problem);
  }

  async update(id: string, dto: UpdateProblemDto): Promise<Problem> {
    const problem = await this.findOne(id);
    const { tagIds, categoryId, ...rest } = dto;
    const previousPerformance = problem.performance;

    Object.assign(problem, rest);

    if (categoryId !== undefined) {
      problem.category = categoryId
        ? ({ id: categoryId } as Category)
        : null;
    }

    if (tagIds !== undefined) {
      problem.tags =
        tagIds.length > 0
          ? await this.tagRepository.findBy({ id: In(tagIds) })
          : [];
    }

    if (rest.performance !== undefined && rest.performance !== previousPerformance) {
      this.applySchedule(problem, rest.performance);
    }

    return this.problemRepository.save(problem);
  }

  async delete(id: string): Promise<void> {
    const result = await this.problemRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Problem ${id} not found`);
  }

  async findDueReviews(): Promise<Problem[]> {
    const now = new Date();
    const items = await this.problemRepository.find({
      where: [
        {
          performance: In([Performance.Bad, Performance.Average]),
          nextReviewAt: LessThanOrEqual(now),
        },
        {
          performance: In([Performance.Bad, Performance.Average]),
          nextReviewAt: IsNull(),
        },
      ],
      relations: ['category', 'tags'],
    });

    return items.sort((a, b) => {
      const perfOrder = (p: Performance | null) =>
        p === Performance.Bad ? 0 : p === Performance.Average ? 1 : 2;
      const perfDiff = perfOrder(a.performance) - perfOrder(b.performance);
      if (perfDiff !== 0) return perfDiff;
      const aDue = a.nextReviewAt?.getTime() ?? 0;
      const bDue = b.nextReviewAt?.getTime() ?? 0;
      return aDue - bDue;
    });
  }

  async markReviewed(
    id: string,
    performance: Performance,
  ): Promise<Problem> {
    const problem = await this.findOne(id);
    problem.performance = performance;
    problem.timesAttempted = (problem.timesAttempted ?? 0) + 1;
    this.applySchedule(problem, performance);
    return this.problemRepository.save(problem);
  }

  /** Restores the exact review-state snapshot captured before a `markReviewed` call, undoing it. */
  async restoreReviewState(id: string, dto: UndoReviewDto): Promise<Problem> {
    const problem = await this.findOne(id);
    problem.performance = dto.performance ?? null;
    problem.timesAttempted = dto.timesAttempted;
    problem.nextReviewAt = dto.nextReviewAt ? new Date(dto.nextReviewAt) : null;
    problem.lastReviewedAt = dto.lastReviewedAt
      ? new Date(dto.lastReviewedAt)
      : null;
    problem.reviewInterval = dto.reviewInterval;
    return this.problemRepository.save(problem);
  }

  private applySchedule(
    problem: Problem,
    performance: Performance | null,
  ): void {
    if (performance === null || performance === Performance.Good) {
      problem.nextReviewAt = null;
      problem.reviewInterval = 0;
      if (performance !== null) {
        problem.lastReviewedAt = new Date();
      }
      return;
    }

    const interval = nextInterval(problem.reviewInterval ?? 0, performance);
    problem.reviewInterval = interval;
    problem.nextReviewAt = addDays(interval);
    problem.lastReviewedAt = new Date();
  }
}
