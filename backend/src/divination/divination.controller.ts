import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator.js';
import { DivinationService } from './divination.service.js';
import { MeihuaService } from './meihua.service.js';
import { ZiweiService } from './ziwei.service.js';
import { QimenService } from './qimen.service.js';
import { LiuyaoService } from './liuyao.service.js';
import { YijingService } from './yijing.service.js';
import { XiaoliurenService } from './xiaoliuren.service.js';
import { XunwuService } from './xunwu.service.js';
import { ZejiService } from './zeji.service.js';
import { NamingService } from './naming.service.js';
import { HehunService } from './hehun.service.js';
import { ShengyiService } from './shengyi.service.js';
import { AiService } from './ai.service.js';
import { FaceService } from './face.service.js';
import { PalmService } from './palm.service.js';
import { TongueService } from './tongue.service.js';
import { FengshuiService } from './fengshui.service.js';
import { DreamService } from './dream.service.js';
import { ChouqianService } from './chouqian.service.js';
import { CreateDivinationDto } from './dto/divination.dto.js';

@ApiTags('占卜')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('divination')
export class DivinationController {
  private readonly logger = new Logger(DivinationController.name);

  constructor(
    private readonly divinationService: DivinationService,
    private readonly meihuaService: MeihuaService,
    private readonly ziweiService: ZiweiService,
    private readonly qimenService: QimenService,
    private readonly liuyaoService: LiuyaoService,
    private readonly yijingService: YijingService,
    private readonly xiaoliurenService: XiaoliurenService,
    private readonly xunwuService: XunwuService,
    private readonly zejiService: ZejiService,
    private readonly namingService: NamingService,
    private readonly hehunService: HehunService,
    private readonly shengyiService: ShengyiService,
    private readonly faceService: FaceService,
    private readonly palmService: PalmService,
    private readonly tongueService: TongueService,
    private readonly fengshuiService: FengshuiService,
    private readonly aiService: AiService,
    private readonly dreamService: DreamService,
    private readonly chouqianService: ChouqianService,
  ) {}

  @Post('bazi')
  @ApiOperation({ summary: '八字排盘' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDivinationDto) {
    return this.divinationService.create(user.sub, dto);
  }

  @Post('meihua')
  @ApiOperation({ summary: '梅花易数 - 姓名起卦' })
  async meihua(
    @CurrentUser() user: JwtPayload,
    @Body() body: { name: string; xingLength?: number },
  ) {
    const result = this.meihuaService.calculate(
      body.name,
      body.xingLength ?? 1,
    );
    const record = await this.divinationService.createRecord(
      user.sub,
      'wen',
      'meihua',
      { name: body.name, xingLength: body.xingLength ?? 1 },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('ziwei')
  @ApiOperation({ summary: '紫微斗数排盘' })
  async ziwei(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      name: string;
      birthYear: number;
      birthMonth: number;
      birthDay: number;
      birthHour: number;
      gender: number;
      isLunar?: boolean;
      birthplace?: string;
      lat?: number;
      lng?: number;
    },
  ) {
    const pan = this.ziweiService.calculate(
      body.birthYear,
      body.birthMonth,
      body.birthDay,
      body.birthHour,
      body.gender,
      body.isLunar ?? false,
    );
    const result = {
      ...pan,
      birthplace: body.birthplace,
      lat: body.lat,
      lng: body.lng,
    };
    const record = await this.divinationService.createRecord(
      user.sub,
      'suan',
      'ziwei',
      {
        name: body.name,
        birthYear: body.birthYear,
        birthMonth: body.birthMonth,
        birthDay: body.birthDay,
        birthHour: body.birthHour,
        gender: body.gender,
        isLunar: body.isLunar ?? false,
        birthplace: body.birthplace,
      },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('qimen')
  @ApiOperation({ summary: '奇门遁甲排盘' })
  async qimen(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      name: string;
      birthYear: number;
      birthMonth: number;
      birthDay: number;
      birthHour: number;
    },
  ) {
    const h = body.birthHour * 2;
    const dateStr = `${body.birthYear}-${String(body.birthMonth).padStart(2, '0')}-${String(body.birthDay).padStart(2, '0')} ${String(h).padStart(2, '0')}:00:00`;
    const result = this.qimenService.calculate(dateStr);
    const record = await this.divinationService.createRecord(
      user.sub,
      'suan',
      'qimen',
      {
        name: body.name,
        birthYear: body.birthYear,
        birthMonth: body.birthMonth,
        birthDay: body.birthDay,
        birthHour: body.birthHour,
      },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('liuyao')
  @ApiOperation({ summary: '六爻占卜' })
  async liuyao(
    @CurrentUser() user: JwtPayload,
    @Body() body: { question: string; numbers?: number[] },
  ) {
    const result = this.liuyaoService.calculate(body.numbers);
    const record = await this.divinationService.createRecord(
      user.sub,
      'wen',
      'liuyao',
      { question: body.question },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('yijing')
  @ApiOperation({ summary: '易经占卜（蓍草法）' })
  async yijing(
    @CurrentUser() user: JwtPayload,
    @Body() body: { question: string },
  ) {
    const result = this.yijingService.calculate();
    const record = await this.divinationService.createRecord(
      user.sub,
      'wen',
      'yijing',
      { question: body.question },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('xiaoliuren')
  @ApiOperation({ summary: '小六壬掐指速算' })
  async xiaoliuren(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      question: string;
      lunarMonth: number;
      lunarDay: number;
      shichen: number;
      customNumbers?: number[];
    },
  ) {
    const result = this.xiaoliurenService.calculate(
      body.lunarMonth,
      body.lunarDay,
      body.shichen,
      body.question,
      body.customNumbers,
    );
    const record = await this.divinationService.createRecord(
      user.sub,
      'wen',
      'xiaoliuren',
      {
        question: body.question,
        lunarMonth: body.lunarMonth,
        lunarDay: body.lunarDay,
        shichen: body.shichen,
      },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('xunwu')
  @ApiOperation({ summary: '寻人寻物' })
  async xunwu(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      type: 'xunwu' | 'xunren';
      question: string;
      numbers: number[];
      itemName?: string;
      personName?: string;
      lostTime?: string;
      lostPlace?: string;
    },
  ) {
    const result = this.xunwuService.calculate(
      body.type,
      body.question,
      body.numbers,
      body.itemName,
      body.personName,
      body.lostTime,
      body.lostPlace,
    );
    const record = await this.divinationService.createRecord(
      user.sub,
      'xun',
      'xunwu',
      {
        type: body.type,
        question: body.question,
        itemName: body.itemName,
        personName: body.personName,
        lostTime: body.lostTime,
        lostPlace: body.lostPlace,
      },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('zeji')
  @ApiOperation({ summary: '择日择吉' })
  async zeji(
    @CurrentUser() user: JwtPayload,
    @Body() body: { eventType: string; startDate: string; endDate: string },
  ) {
    const result = this.zejiService.calculate(
      body.eventType,
      body.startDate,
      body.endDate,
    );
    const record = await this.divinationService.createRecord(
      user.sub,
      'xun',
      'zeji',
      {
        eventType: body.eventType,
        startDate: body.startDate,
        endDate: body.endDate,
      },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('naming')
  @ApiOperation({ summary: '起名改名' })
  async naming(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      surname: string;
      gender: string;
      birthYear: number;
      birthMonth: number;
      birthDay: number;
      birthHour: number;
      name?: string;
      mode?: string;
    },
  ) {
    const result = this.namingService.calculate(
      body.surname,
      body.gender,
      body.birthYear,
      body.birthMonth,
      body.birthDay,
      body.birthHour,
      body.name,
    );
    const record = await this.divinationService.createRecord(
      user.sub,
      'xun',
      'naming',
      {
        name: body.surname + (body.name || ''),
        surname: body.surname,
        gender: body.gender,
        birthYear: body.birthYear,
        birthMonth: body.birthMonth,
        birthDay: body.birthDay,
        birthHour: body.birthHour,
      },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('hehun')
  @ApiOperation({ summary: '合婚配对' })
  async hehun(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      maleName: string;
      maleBirthYear: number;
      maleBirthMonth: number;
      maleBirthDay: number;
      maleBirthHour: string;
      femaleName: string;
      femaleBirthYear: number;
      femaleBirthMonth: number;
      femaleBirthDay: number;
      femaleBirthHour: string;
    },
  ) {
    const result = this.hehunService.calculate(
      {
        name: body.maleName,
        gender: 1,
        birthYear: body.maleBirthYear,
        birthMonth: body.maleBirthMonth,
        birthDay: body.maleBirthDay,
        birthHour: body.maleBirthHour,
      },
      {
        name: body.femaleName,
        gender: 2,
        birthYear: body.femaleBirthYear,
        birthMonth: body.femaleBirthMonth,
        birthDay: body.femaleBirthDay,
        birthHour: body.femaleBirthHour,
      },
    );
    const record = await this.divinationService.createRecord(
      user.sub,
      'xun',
      'hehun',
      {
        name: `${body.maleName} & ${body.femaleName}`,
        maleName: body.maleName,
        femaleName: body.femaleName,
      },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('shengyi')
  @ApiOperation({ summary: '生意合伙分析' })
  async shengyi(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      selfName: string;
      selfBirthYear: number;
      selfBirthMonth: number;
      selfBirthDay: number;
      selfBirthHour: string;
      partners: {
        name: string;
        birthYear: number;
        birthMonth: number;
        birthDay: number;
        birthHour: string;
      }[];
      industry: string;
    },
  ) {
    const result = this.shengyiService.calculate(
      {
        name: body.selfName,
        birthYear: body.selfBirthYear,
        birthMonth: body.selfBirthMonth,
        birthDay: body.selfBirthDay,
        birthHour: body.selfBirthHour,
      },
      body.partners,
      body.industry,
    );
    const record = await this.divinationService.createRecord(
      user.sub,
      'xun',
      'shengyi',
      {
        selfName: body.selfName,
        partners: body.partners.map((p) => p.name),
        industry: body.industry,
      },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('face')
  @ApiOperation({ summary: '面相分析' })
  async face(
    @CurrentUser() user: JwtPayload,
    @Body() body: { image: string; gender?: string; birthYear?: number },
  ) {
    const result = this.faceService.analyze(
      body.image,
      body.gender,
      body.birthYear,
    );
    const record = await this.divinationService.createRecord(
      user.sub,
      'xiang',
      'face',
      { gender: body.gender, birthYear: body.birthYear },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('palm')
  @ApiOperation({ summary: '手相解读' })
  async palm(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: { image: string; hand?: string; gender?: string; birthYear?: number },
  ) {
    const result = this.palmService.analyze(
      body.image,
      body.hand,
      body.gender,
      body.birthYear,
    );
    const record = await this.divinationService.createRecord(
      user.sub,
      'xiang',
      'palm',
      { hand: body.hand, gender: body.gender, birthYear: body.birthYear },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('tongue')
  @ApiOperation({ summary: '舌相分析' })
  async tongue(
    @CurrentUser() user: JwtPayload,
    @Body() body: { image: string; gender?: string; birthYear?: number },
  ) {
    const result = this.tongueService.analyze(
      body.image,
      body.gender,
      body.birthYear,
    );
    const record = await this.divinationService.createRecord(
      user.sub,
      'xiang',
      'tongue',
      { gender: body.gender, birthYear: body.birthYear },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('fengshui')
  @ApiOperation({ summary: '风水布局分析' })
  async fengshui(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      image: string;
      direction?: string;
      houseType?: string;
      ownerGender?: string;
      ownerBirthYear?: number;
    },
  ) {
    const result = this.fengshuiService.analyze(
      body.image,
      body.direction,
      body.houseType,
      body.ownerGender,
      body.ownerBirthYear,
    );
    const record = await this.divinationService.createRecord(
      user.sub,
      'xiang',
      'fengshui',
      {
        direction: body.direction,
        houseType: body.houseType,
        ownerGender: body.ownerGender,
        ownerBirthYear: body.ownerBirthYear,
      },
      result,
    );
    return { ...result, id: record.id };
  }

  @Post('dream')
  @ApiOperation({ summary: '周公解梦' })
  async dream(
    @CurrentUser() user: JwtPayload,
    @Body() body: { dream: string },
  ) {
    const result = this.dreamService.calculate(body.dream);
    const record = await this.divinationService.createRecord(
      user.sub,
      'wen',
      'dream',
      { dream: body.dream },
      result,
    );
    return { ...result, id: record.id };
  }

  @Get('chouqian/buckets')
  @ApiOperation({ summary: '获取签桶列表' })
  getBuckets() {
    return this.chouqianService.getBuckets();
  }

  @Post('chouqian/draw')
  @ApiOperation({ summary: '抽签' })
  async draw(
    @CurrentUser() user: JwtPayload,
    @Body() body: { bucketId: string },
  ) {
    const result = this.chouqianService.draw(body.bucketId);
    const record = await this.divinationService.createRecord(
      user.sub,
      'wen',
      'chouqian',
      { bucketId: body.bucketId, bucketName: result.bucket.name },
      result,
    );
    return { ...result, id: record.id };
  }

  @Get('chouqian/:bucketId/:signId')
  @ApiOperation({ summary: '获取签文详情' })
  getSignDetail(
    @Param('bucketId') bucketId: string,
    @Param('signId') signId: string,
  ) {
    return this.chouqianService.getSignDetail(bucketId, parseInt(signId, 10));
  }

  @Post('ai-stream')
  @ApiOperation({ summary: 'AI 流式解读（SSE）' })
  async aiStream(
    @Body()
    body: { type: string; data: any; extraParams?: any; recordId?: string },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // 先查询缓存
    const cachedResult = await this.divinationService.findCachedAiResult(
      body.type,
      body.data,
    );
    if (cachedResult) {
      this.logger.log(`使用缓存的 AI 结果: ${body.type}`);
      // 直接返回缓存结果
      res.write(
        `data: ${JSON.stringify({ done: true, parsed: cachedResult, cached: true })}\n\n`,
      );
      if (body.recordId) {
        this.divinationService
          .updateAiResult(body.recordId, cachedResult)
          .catch((e) => this.logger.error('更新AI结果失败', e));
      }
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    let fullText = '';
    try {
      const { system, user, maxTokens, timeout, temperature } =
        this.aiService.getPromptConfig(body.type, body.data, body.extraParams);
      const stream =
        (body.type === 'face' ||
          body.type === 'palm' ||
          body.type === 'tongue' ||
          body.type === 'fengshui') &&
        body.extraParams?.image
          ? this.aiService.streamVisionInterpretation(
              system,
              user,
              body.extraParams.image,
              maxTokens,
              timeout,
              temperature,
            )
          : this.aiService.streamInterpretation(
              system,
              user,
              maxTokens,
              timeout,
              temperature,
            );
      for await (const token of stream) {
        fullText += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
      const parsed = this.aiService.safeParseJson<any>(fullText);
      res.write(`data: ${JSON.stringify({ done: true, parsed })}\n\n`);
      if (body.recordId) {
        this.divinationService
          .updateAiResult(body.recordId, parsed)
          .catch((e) => this.logger.error('更新AI结果失败', e));
      }
    } catch (err) {
      this.logger.error('AI stream error', err);
      const fallback = this.aiService.getFallback(body.type, body.data);
      res.write(`data: ${JSON.stringify({ error: true, fallback })}\n\n`);
      if (body.recordId) {
        this.divinationService
          .updateAiResult(body.recordId, fallback)
          .catch((e) => this.logger.error('更新fallback失败', e));
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }

  @Get('history')
  @ApiOperation({ summary: '获取占卜历史' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  findHistory(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.divinationService.findHistory(
      user.sub,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取占卜详情（含八字+AI解读）' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.divinationService.findOne(user.sub, id);
  }
}
