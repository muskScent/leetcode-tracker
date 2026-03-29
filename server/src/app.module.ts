import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { ProblemsModule } from './problems/problems.module';
import { StatsModule } from './stats/stats.module';
import { Category } from './categories/category.entity';
import { Tag } from './tags/tag.entity';
import { Problem } from './problems/problem.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'leetcode-tracker.sqlite',
      entities: [Category, Tag, Problem],
      synchronize: true,
    }),
    CategoriesModule,
    TagsModule,
    ProblemsModule,
    StatsModule,
  ],
})
export class AppModule {}
