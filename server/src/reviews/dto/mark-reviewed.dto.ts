import { IsEnum } from 'class-validator';
import { Performance } from '../../problems/problem.entity';

export class MarkReviewedDto {
  @IsEnum(Performance)
  performance: Performance;
}
