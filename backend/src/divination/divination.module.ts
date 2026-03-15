import { Module } from '@nestjs/common';
import { DivinationService } from './divination.service.js';
import { DivinationController } from './divination.controller.js';
import { BaZiService } from './bazi.service.js';
import { AiService } from './ai.service.js';
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
import { FaceService } from './face.service.js';
import { PalmService } from './palm.service.js';
import { TongueService } from './tongue.service.js';
import { FengshuiService } from './fengshui.service.js';
import { DreamService } from './dream.service.js';
import { ChouqianService } from './chouqian.service.js';

@Module({
  controllers: [DivinationController],
  providers: [
    DivinationService,
    BaZiService,
    AiService,
    MeihuaService,
    ZiweiService,
    QimenService,
    LiuyaoService,
    YijingService,
    XiaoliurenService,
    XunwuService,
    ZejiService,
    NamingService,
    HehunService,
    ShengyiService,
    FaceService,
    PalmService,
    TongueService,
    FengshuiService,
    DreamService,
    ChouqianService,
  ],
})
export class DivinationModule {}
