import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find({ order: { name: 'ASC' } });
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    const tag = this.tagRepository.create(dto);
    return this.tagRepository.save(tag);
  }

  async delete(id: string): Promise<void> {
    const result = await this.tagRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Tag ${id} not found`);
  }
}
