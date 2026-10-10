import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
