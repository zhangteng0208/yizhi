import { Module } from '@nestjs/common';
import { DailyFortuneService } from './daily-fortune.service.js';
import { DailyFortuneController } from './daily-fortune.controller.js';

@Module({
  controllers: [DailyFortuneController],
  providers: [DailyFortuneService],
})
export class DailyFortuneModule {}
