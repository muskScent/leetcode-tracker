import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Problem } from '../problems/problem.entity';
import { Category } from '../categories/category.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Problem, Category])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
