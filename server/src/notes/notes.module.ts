import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './note.entity';
import { Tag } from '../tags/tag.entity';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Note, Tag])],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
