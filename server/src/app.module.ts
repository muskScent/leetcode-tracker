import { join } from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { ProblemsModule } from './problems/problems.module';
import { NotesModule } from './notes/notes.module';
import { ReviewsModule } from './reviews/reviews.module';
import { StatsModule } from './stats/stats.module';
import { Category } from './categories/category.entity';
import { Tag } from './tags/tag.entity';
import { Problem } from './problems/problem.entity';
import { Note } from './notes/note.entity';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH ?? 'leetcode-tracker.sqlite',
      entities: [Category, Tag, Problem, Note],
      synchronize: true,
    }),
    ...(isProduction
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'client', 'dist'),
            exclude: ['/api/(.*)'],
          }),
        ]
      : []),
    CategoriesModule,
    TagsModule,
    ProblemsModule,
    NotesModule,
    ReviewsModule,
    StatsModule,
  ],
})
export class AppModule {}
