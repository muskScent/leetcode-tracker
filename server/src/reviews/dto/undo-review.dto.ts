import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Performance } from '../../problems/problem.entity';

export class UndoReviewDto {
  @IsOptional()
  @IsEnum(Performance)
  performance?: Performance | null;

  @IsInt()
  @Min(0)
  timesAttempted: number;

  @IsOptional()
  @IsDateString()
  nextReviewAt?: string | null;

  @IsOptional()
  @IsDateString()
  lastReviewedAt?: string | null;

  @IsInt()
  @Min(0)
  reviewInterval: number;
}
