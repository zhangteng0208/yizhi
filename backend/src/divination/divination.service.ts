import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaZiService } from './bazi.service.js';
import { CreateDivinationDto } from './dto/divination.dto.js';

@Injectable()
export class DivinationService {
  private readonly logger = new Logger(DivinationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly baziService: BaZiService,
  ) {}

  /** 生成命格特征哈希 */
  private generateFeatureHash(type: string, data: any, depth?: string): string {
    let featureString = '';

    if (type === 'bazi') {
      // 八字：使用四柱和深度作为特征
      const bazi = data.bazi || data;
      featureString = `bazi:${bazi.rawBaZi || ''}:depth:${depth || 'normal'}`;
    } else if (type === 'ziwei') {
      // 紫微：使用命宫主星和五行局作为特征
      featureString = `ziwei:${data.mingMainStar || ''}:${data.fiveElementsClass || ''}:depth:${depth || 'normal'}`;
    } else if (type === 'qimen') {
      // 奇门：使用局数和时间信息作为特征
      featureString = `qimen:${data.ju?.type || ''}${data.ju?.number || ''}:${data.yuan || ''}:depth:${depth || 'normal'}`;
    } else {
      // 其他类型暂不缓存
      return '';
    }

    return createHash('sha256').update(featureString).digest('hex');
  }

  /** 查找已有的 AI 结果（基于命格特征） */
  async findCachedAiResult(type: string, data: any, depth?: string): Promise<any | null> {
    const featureHash = this.generateFeatureHash(type, data, depth);
    if (!featureHash) return null;

    const cached = await this.prisma.divination_records.findFirst({
      where: {
        feature_hash: featureHash,
        status: 1, // 只查询已完成 AI 解析的记录
        result: { not: Prisma.DbNull },
      },
      orderBy: { created_at: 'desc' },
      select: { result: true },
    });

    if (cached?.result) {
      this.logger.log(`命格缓存命中: ${featureHash.slice(0, 8)}...`);
      return cached.result;
    }

    return null;
  }

  /** 创建八字排盘（不含 AI，AI 通过 ai-stream 端点异步获取） */
  async create(userId: string, dto: CreateDivinationDto) {
    const baziResult = this.baziService.calculate(
      dto.birthYear,
      dto.birthMonth,
      dto.birthDay,
      dto.birthHour,
      dto.gender,
      dto.isLunar ?? false,
    );

    const featureHash = this.generateFeatureHash('bazi', { bazi: baziResult });

    const record = await this.prisma.divination_records.create({
      data: {
        user_id: userId,
        category: 'bazi',
        service_code: 'bazi_basic',
        input_params: {
          name: dto.name,
          gender: dto.gender,
          birthYear: dto.birthYear,
          birthMonth: dto.birthMonth,
          birthDay: dto.birthDay,
          birthHour: dto.birthHour,
          isLunar: dto.isLunar ?? false,
          question: dto.question,
        } as unknown as Prisma.InputJsonValue,
        divination_data: {
          bazi: baziResult,
        } as unknown as Prisma.InputJsonValue,
        feature_hash: featureHash || undefined,
        status: 0,
      },
    });

    return {
      id: record.id,
      bazi: baziResult,
      status: 0,
      created_at: record.created_at,
    };
  }

  /** 通用：创建占卜记录 */
  async createRecord(
    userId: string,
    category: string,
    serviceCode: string,
    inputParams: any,
    divinationData: any,
  ) {
    // 根据服务类型生成特征哈希
    let featureHash = '';
    if (serviceCode === 'ziwei') {
      featureHash = this.generateFeatureHash('ziwei', divinationData);
    } else if (serviceCode === 'qimen') {
      featureHash = this.generateFeatureHash('qimen', divinationData);
    }

    const record = await this.prisma.divination_records.create({
      data: {
        user_id: userId,
        category,
        service_code: serviceCode,
        input_params: inputParams as unknown as Prisma.InputJsonValue,
        divination_data: divinationData as unknown as Prisma.InputJsonValue,
        feature_hash: featureHash || undefined,
        status: 0,
      },
    });
    return record;
  }

  /** AI 流式解读完成后，更新记录 */
  async updateAiResult(
    recordId: string,
    aiResult: any,
    aiModel?: string,
    tokensUsed?: number,
  ) {
    await this.prisma.divination_records.update({
      where: { id: recordId },
      data: {
        result: aiResult as unknown as Prisma.InputJsonValue,
        result_summary: aiResult?.mingju?.slice(0, 100) ?? null,
        status: aiResult ? 1 : 0,
        ai_model: aiModel || 'deepseek-chat',
        ai_tokens_used: tokensUsed || 0,
      },
    });
  }

  async findHistory(userId: string, page = 1, pageSize = 10) {
    const [records, total] = await Promise.all([
      this.prisma.divination_records.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.divination_records.count({ where: { user_id: userId } }),
    ]);
    return { records, total, page, pageSize };
  }

  async findOne(userId: string, id: string) {
    const record = await this.prisma.divination_records.findFirst({
      where: { id, user_id: userId },
    });
    if (!record) throw new NotFoundException('记录不存在');

    return {
      id: record.id,
      input_params: record.input_params,
      bazi: (record.divination_data as any)?.bazi ?? null,
      ai: record.result ?? null,
      status: record.status,
      created_at: record.created_at,
    };
  }
}
