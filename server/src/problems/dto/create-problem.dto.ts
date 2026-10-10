import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  IsInt,
  IsUUID,
  Min,
} from 'class-validator';
import { Difficulty, Performance, Status } from '../problem.entity';

export class CreateProblemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  leetcodeUrl?: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsEnum(Performance)
  performance?: Performance | null;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @IsOptional()
  @IsString()
  keyTechniques?: string;

  @IsOptional()
  @IsString()
  performanceComment?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  timesAttempted?: number;
}
