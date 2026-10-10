import { Module } from '@nestjs/common';
import { ProblemsModule } from '../problems/problems.module';
import { ReviewsController } from './reviews.controller';

@Module({
  imports: [ProblemsModule],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
