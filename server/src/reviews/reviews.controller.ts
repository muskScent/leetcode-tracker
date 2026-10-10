import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProblemsService } from '../problems/problems.service';
import { MarkReviewedDto } from './dto/mark-reviewed.dto';
import { UndoReviewDto } from './dto/undo-review.dto';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Get('due')
  findDue() {
    return this.problemsService.findDueReviews();
  }

  @Post(':id')
  markReviewed(
    @Param('id') id: string,
    @Body() dto: MarkReviewedDto,
  ) {
    return this.problemsService.markReviewed(id, dto.performance);
  }

  @Post(':id/undo')
  undo(@Param('id') id: string, @Body() dto: UndoReviewDto) {
    return this.problemsService.restoreReviewState(id, dto);
  }
}
