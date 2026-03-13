import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class DailyFortuneService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getTodayFortune(userId: string) {
    const profile = await this.prisma.user_profiles.findFirst({
      where: { user_id: userId, is_default: true },
    });
    if (!profile) throw new NotFoundException('请先完善个人档案');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 先查 Redis 缓存
    const cacheKey = `fortune:${profile.id}:${today.toISOString().slice(0, 10)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // 查数据库
    let fortune = await this.prisma.daily_fortune.findUnique({
      where: { profile_id_fortune_date: { profile_id: profile.id, fortune_date: today } },
    });

    if (!fortune) {
      // TODO: 接入真实运势算法，当前为占位数据
      const fortuneData = this.generatePlaceholderFortune();
      fortune = await this.prisma.daily_fortune.create({
        data: {
          profile_id: profile.id,
          fortune_date: today,
          fortune_data: fortuneData,
        },
      });
    }

    // 缓存到当天结束
    const ttl = this.getSecondsUntilMidnight();
    await this.redis.set(cacheKey, JSON.stringify(fortune), 'EX', ttl);

    return fortune;
  }

  private generatePlaceholderFortune() {
    const levels = ['大吉', '吉', '中吉', '小吉', '末吉'];
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    return {
      overall: pick(levels),
      love: pick(levels),
      career: pick(levels),
      wealth: pick(levels),
      health: pick(levels),
      lucky_color: pick(['红色', '蓝色', '绿色', '金色', '紫色']),
      lucky_number: Math.floor(Math.random() * 9) + 1,
      advice: '今日宜静心养性，不宜冲动行事。',
    };
  }

  private getSecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  }
}
