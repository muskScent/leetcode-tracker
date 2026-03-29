import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Difficulty, Status } from '../problem.entity';

export class FilterProblemsDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
