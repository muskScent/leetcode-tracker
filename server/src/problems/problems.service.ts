import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Problem } from './problem.entity';
import { Tag } from '../tags/tag.entity';
import { Category } from '../categories/category.entity';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { FilterProblemsDto } from './dto/filter-problems.dto';

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
      query.andWhere('LOWER(tags.name) = LOWER(:tag)', { tag: filters.tag });
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

    return this.problemRepository.save(problem);
  }

  async update(id: string, dto: UpdateProblemDto): Promise<Problem> {
    const problem = await this.findOne(id);
    const { tagIds, categoryId, ...rest } = dto;

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

    return this.problemRepository.save(problem);
  }

  async delete(id: string): Promise<void> {
    const result = await this.problemRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Problem ${id} not found`);
  }
}
