import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Note } from './note.entity';
import { Tag } from '../tags/tag.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { FilterNotesDto } from './dto/filter-notes.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async findAll(filters: FilterNotesDto): Promise<Note[]> {
    const query = this.noteRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.tags', 'tags');

    if (filters.tag) {
      query.andWhere('LOWER(tags.name) = LOWER(:tag)', { tag: filters.tag });
    }
    if (filters.search) {
      query.andWhere(
        '(LOWER(note.title) LIKE LOWER(:search) OR LOWER(note.content) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    return query.orderBy('note.updatedAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!note) throw new NotFoundException(`Note ${id} not found`);
    return note;
  }

  async create(dto: CreateNoteDto): Promise<Note> {
    const { tagIds, ...rest } = dto;
    const note = this.noteRepository.create(rest as Partial<Note>);

    if (tagIds && tagIds.length > 0) {
      note.tags = await this.tagRepository.findBy({ id: In(tagIds) });
    } else {
      note.tags = [];
    }

    return this.noteRepository.save(note);
  }

  async update(id: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(id);
    const { tagIds, ...rest } = dto;

    Object.assign(note, rest);

    if (tagIds !== undefined) {
      note.tags =
        tagIds.length > 0
          ? await this.tagRepository.findBy({ id: In(tagIds) })
          : [];
    }

    return this.noteRepository.save(note);
  }

  async delete(id: string): Promise<void> {
    const result = await this.noteRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Note ${id} not found`);
  }
}
