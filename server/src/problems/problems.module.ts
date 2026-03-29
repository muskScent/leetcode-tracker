import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Problem } from './problem.entity';
import { Tag } from '../tags/tag.entity';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';

@Module({
  imports: [TypeOrmModule.forFeature([Problem, Tag])],
  controllers: [ProblemsController],
  providers: [ProblemsService],
})
export class ProblemsModule {}
