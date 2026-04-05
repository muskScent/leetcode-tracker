import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('api/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  getOverview(@Query('tagIds') tagIds?: string) {
    const ids = tagIds ? tagIds.split(',').filter(Boolean) : undefined;
    return this.statsService.getOverview(ids);
  }
}
