import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator.js';
import { DailyFortuneService } from './daily-fortune.service.js';

@ApiTags('每日运势')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('daily-fortune')
export class DailyFortuneController {
  constructor(private readonly dailyFortuneService: DailyFortuneService) {}

  @Get('today')
  @ApiOperation({ summary: '获取今日运势' })
  getTodayFortune(@CurrentUser() user: JwtPayload) {
    return this.dailyFortuneService.getTodayFortune(user.sub);
  }
}
