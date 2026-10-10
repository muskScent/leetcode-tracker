import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { FilterNotesDto } from './dto/filter-notes.dto';

@Controller('api/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(@Query() filters: FilterNotesDto) {
    return this.notesService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateNoteDto) {
    return this.notesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.notesService.delete(id);
  }
}
