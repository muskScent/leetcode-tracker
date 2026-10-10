import { IsOptional, IsString } from 'class-validator';

export class FilterNotesDto {
  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
