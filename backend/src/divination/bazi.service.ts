import { Injectable, Logger } from '@nestjs/common';

// lunar-javascript 没有类型声明，使用 require 导入
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar, Lunar, LunarUtil } = require('lunar-javascript');

/** 天干 */
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
/** 地支 */
const DI_ZHI = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
];
/** 五行对应 */
const GAN_WUXING: Record<string, string> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};
const ZHI_WUXING: Record<string, string> = {
  子: '水',
  丑: '土',
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水',
};

/** 时辰对应地支索引 */
const SHICHEN_MAP: Record<string, number> = {
  子: 0,
  丑: 1,
  寅: 2,
  卯: 3,
  辰: 4,
  巳: 5,
  午: 6,
  未: 7,
  申: 8,
  酉: 9,
  戌: 10,
  亥: 11,
};

/** 时辰对应小时范围 */
const SHICHEN_HOUR: Record<string, number> = {
  子: 0,
  丑: 2,
  寅: 4,
  卯: 6,
  辰: 8,
  巳: 10,
  午: 12,
  未: 14,
  申: 16,
  酉: 18,
  戌: 20,
  亥: 22,
};

/** 十二长生表：日干 -> 地支 -> 长生状态 */
const CHANG_SHENG_MAP: Record<string, Record<string, string>> = {
  甲: {
    亥: '长生',
    子: '沐浴',
    丑: '冠带',
    寅: '临官',
    卯: '帝旺',
    辰: '衰',
    巳: '病',
    午: '死',
    未: '墓',
    申: '绝',
    酉: '胎',
    戌: '养',
  },
  乙: {
    午: '长生',
    巳: '沐浴',
    辰: '冠带',
    卯: '临官',
    寅: '帝旺',
    丑: '衰',
    子: '病',
    亥: '死',
    戌: '墓',
    酉: '绝',
    申: '胎',
    未: '养',
  },
  丙: {
    寅: '长生',
    卯: '沐浴',
    辰: '冠带',
    巳: '临官',
    午: '帝旺',
    未: '衰',
    申: '病',
    酉: '死',
    戌: '墓',
    亥: '绝',
    子: '胎',
    丑: '养',
  },
  丁: {
    酉: '长生',
    申: '沐浴',
    未: '冠带',
    午: '临官',
    巳: '帝旺',
    辰: '衰',
    卯: '病',
    寅: '死',
    丑: '墓',
    子: '绝',
    亥: '胎',
    戌: '养',
  },
  戊: {
    寅: '长生',
    卯: '沐浴',
    辰: '冠带',
    巳: '临官',
    午: '帝旺',
    未: '衰',
    申: '病',
    酉: '死',
    戌: '墓',
    亥: '绝',
    子: '胎',
    丑: '养',
  },
  己: {
    酉: '长生',
    申: '沐浴',
    未: '冠带',
    午: '临官',
    巳: '帝旺',
    辰: '衰',
    卯: '病',
    寅: '死',
    丑: '墓',
    子: '绝',
    亥: '胎',
    戌: '养',
  },
  庚: {
    巳: '长生',
    午: '沐浴',
    未: '冠带',
    申: '临官',
    酉: '帝旺',
    戌: '衰',
    亥: '病',
    子: '死',
    丑: '墓',
    寅: '绝',
    卯: '胎',
    辰: '养',
  },
  辛: {
    子: '长生',
    亥: '沐浴',
    戌: '冠带',
    酉: '临官',
    申: '帝旺',
    未: '衰',
    午: '病',
    巳: '死',
    辰: '墓',
    卯: '绝',
    寅: '胎',
    丑: '养',
  },
  壬: {
    申: '长生',
    酉: '沐浴',
    戌: '冠带',
    亥: '临官',
    子: '帝旺',
    丑: '衰',
    寅: '病',
    卯: '死',
    辰: '墓',
    巳: '绝',
    午: '胎',
    未: '养',
  },
  癸: {
    卯: '长生',
    寅: '沐浴',
    丑: '冠带',
    子: '临官',
    亥: '帝旺',
    戌: '衰',
    酉: '病',
    申: '死',
    未: '墓',
    午: '绝',
    巳: '胎',
    辰: '养',
  },
};

export interface BaZiPillar {
  tianGan: string; // 天干
  diZhi: string; // 地支
  wuXing: string; // 天干五行+地支五行
  naYin: string; // 纳音
  shiShen: string; // 十神
  cangGan: string[]; // 藏干
  changSheng: string; // 十二长生
  kongWang: string; // 空亡
}

export interface BaZiResult {
  siZhu: {
    year: BaZiPillar;
    month: BaZiPillar;
    day: BaZiPillar;
    hour: BaZiPillar;
  };
  wuXingCount: Record<string, number>; // 金木水火土 各几个
  wuXingLack: string[]; // 五行缺失
  riZhu: string; // 日主（日干）
  riZhuWuXing: string; // 日主五行
  shenQiangRuo: string; // 身强/身弱
  yongShen: string; // 用神
  jiShen: string; // 忌神
  geJu: string; // 格局
  daYun: DaYunItem[]; // 大运
  lunarInfo: {
    lunarYear: string;
    lunarMonth: string;
    lunarDay: string;
    shengXiao: string; // 生肖
    xingZuo: string; // 星座
  };
  rawBaZi: string; // 如 "甲子 乙丑 丙寅 丁卯"
}

export interface DaYunItem {
  startAge: number;
  endAge: number;
  tianGan: string;
  diZhi: string;
  wuXing: string;
}

@Injectable()
export class BaZiService {
  private readonly logger = new Logger(BaZiService.name);

  /**
   * 八字排盘主方法
   * @param year 出生年
   * @param month 出生月
   * @param day 出生日
   * @param hour 时辰（地支，如 "寅"）
   * @param gender 1=男 2=女
   * @param isLunar 是否农历输入
   */
  calculate(
    year: number,
    month: number,
    day: number,
    hour: string,
    gender: number,
    isLunar: boolean = false,
  ): BaZiResult {
    // 获取 Solar 和 Lunar 对象
    let solar: any;
    let lunar: any;
    if (isLunar) {
      lunar = Lunar.fromYmd(year, month, day);
      solar = lunar.getSolar();
    } else {
      solar = Solar.fromYmd(year, month, day);
      lunar = solar.getLunar();
    }

    // 设置时辰对应的小时，用于精确排盘
    const hourValue = SHICHEN_HOUR[hour] ?? 12;
    const solarWithTime = Solar.fromYmdHms(
      solar.getYear(),
      solar.getMonth(),
      solar.getDay(),
      hourValue,
      0,
      0,
    );
    const lunarWithTime = solarWithTime.getLunar();
    const eightChar = lunarWithTime.getEightChar();

    // 提取四柱
    const siZhu = this.extractSiZhu(eightChar, lunarWithTime);

    // 统计五行
    const wuXingCount = this.countWuXing(siZhu);
    const wuXingLack = this.findWuXingLack(wuXingCount);

    // 日主分析
    const riZhu = siZhu.day.tianGan;
    const riZhuWuXing = GAN_WUXING[riZhu] || '未知';

    // 身强身弱判断
    const shenQiangRuo = this.judgeShenQiangRuo(riZhuWuXing, wuXingCount);

    // 用神忌神
    const { yongShen, jiShen } = this.determineYongJiShen(
      riZhuWuXing,
      shenQiangRuo,
    );

    // 格局
    const geJu = this.determineGeJu(siZhu, riZhu);

    // 大运
    const daYun = this.extractDaYun(eightChar, gender);

    // 农历信息
    const lunarInfo = {
      lunarYear: `${lunar.getYearInGanZhi()}年`,
      lunarMonth: `${lunar.getMonthInChinese()}月`,
      lunarDay: lunar.getDayInChinese(),
      shengXiao: lunar.getYearShengXiao(),
      xingZuo: solar.getXingZuo(),
    };

    const rawBaZi = `${siZhu.year.tianGan}${siZhu.year.diZhi} ${siZhu.month.tianGan}${siZhu.month.diZhi} ${siZhu.day.tianGan}${siZhu.day.diZhi} ${siZhu.hour.tianGan}${siZhu.hour.diZhi}`;

    return {
      siZhu,
      wuXingCount,
      wuXingLack,
      riZhu,
      riZhuWuXing,
      shenQiangRuo,
      yongShen,
      jiShen,
      geJu,
      daYun,
      lunarInfo,
      rawBaZi,
    };
  }

  /** 提取四柱 */
  private extractSiZhu(eightChar: any, lunar: any) {
    const yearGan = eightChar.getYearGan();
    const yearZhi = eightChar.getYearZhi();
    const monthGan = eightChar.getMonthGan();
    const monthZhi = eightChar.getMonthZhi();
    const dayGan = eightChar.getDayGan();
    const dayZhi = eightChar.getDayZhi();
    const hourGan = eightChar.getTimeGan();
    const hourZhi = eightChar.getTimeZhi();

    const dayGanWuXing = GAN_WUXING[dayGan] || '';

    // 获取空亡
    const yearXunKong = lunar.getYearXunKong();
    const monthXunKong = lunar.getMonthXunKong();
    const dayXunKong = lunar.getDayXunKong();
    const timeXunKong = lunar.getTimeXunKong();

    return {
      year: {
        tianGan: yearGan,
        diZhi: yearZhi,
        wuXing: `${GAN_WUXING[yearGan] || ''}${ZHI_WUXING[yearZhi] || ''}`,
        naYin: eightChar.getYearNaYin(),
        shiShen: this.getShiShen(dayGan, yearGan),
        cangGan: LunarUtil.ZHI_HIDE_GAN[yearZhi] || [],
        changSheng: this.getChangSheng(dayGan, yearZhi),
        kongWang: yearXunKong,
      },
      month: {
        tianGan: monthGan,
        diZhi: monthZhi,
        wuXing: `${GAN_WUXING[monthGan] || ''}${ZHI_WUXING[monthZhi] || ''}`,
        naYin: eightChar.getMonthNaYin(),
        shiShen: this.getShiShen(dayGan, monthGan),
        cangGan: LunarUtil.ZHI_HIDE_GAN[monthZhi] || [],
        changSheng: this.getChangSheng(dayGan, monthZhi),
        kongWang: monthXunKong,
      },
      day: {
        tianGan: dayGan,
        diZhi: dayZhi,
        wuXing: `${GAN_WUXING[dayGan] || ''}${ZHI_WUXING[dayZhi] || ''}`,
        naYin: eightChar.getDayNaYin(),
        shiShen: '日主',
        cangGan: LunarUtil.ZHI_HIDE_GAN[dayZhi] || [],
        changSheng: this.getChangSheng(dayGan, dayZhi),
        kongWang: dayXunKong,
      },
      hour: {
        tianGan: hourGan,
        diZhi: hourZhi,
        wuXing: `${GAN_WUXING[hourGan] || ''}${ZHI_WUXING[hourZhi] || ''}`,
        naYin: eightChar.getTimeNaYin(),
        shiShen: this.getShiShen(dayGan, hourGan),
        cangGan: LunarUtil.ZHI_HIDE_GAN[hourZhi] || [],
        changSheng: this.getChangSheng(dayGan, hourZhi),
        kongWang: timeXunKong,
      },
    };
  }

  /** 获取十二长生 */
  private getChangSheng(dayGan: string, diZhi: string): string {
    return CHANG_SHENG_MAP[dayGan]?.[diZhi] || '';
  }

  /** 十神推算 */
  private getShiShen(dayGan: string, otherGan: string): string {
    if (dayGan === otherGan) return '比肩';
    const dayIdx = TIAN_GAN.indexOf(dayGan);
    const otherIdx = TIAN_GAN.indexOf(otherGan);
    if (dayIdx < 0 || otherIdx < 0) return '未知';

    const dayWx = GAN_WUXING[dayGan];
    const otherWx = GAN_WUXING[otherGan];
    const sameYinYang = dayIdx % 2 === otherIdx % 2;

    // 五行生克关系推十神
    const relations: Record<string, Record<string, [string, string]>> = {
      木: {
        木: ['比肩', '劫财'],
        火: ['食神', '伤官'],
        土: ['偏财', '正财'],
        金: ['七杀', '正官'],
        水: ['偏印', '正印'],
      },
      火: {
        火: ['比肩', '劫财'],
        土: ['食神', '伤官'],
        金: ['偏财', '正财'],
        水: ['七杀', '正官'],
        木: ['偏印', '正印'],
      },
      土: {
        土: ['比肩', '劫财'],
        金: ['食神', '伤官'],
        水: ['偏财', '正财'],
        木: ['七杀', '正官'],
        火: ['偏印', '正印'],
      },
      金: {
        金: ['比肩', '劫财'],
        水: ['食神', '伤官'],
        木: ['偏财', '正财'],
        火: ['七杀', '正官'],
        土: ['偏印', '正印'],
      },
      水: {
        水: ['比肩', '劫财'],
        木: ['食神', '伤官'],
        火: ['偏财', '正财'],
        土: ['七杀', '正官'],
        金: ['偏印', '正印'],
      },
    };

    const pair = relations[dayWx]?.[otherWx];
    if (!pair) return '未知';
    return sameYinYang ? pair[0] : pair[1];
  }

  /** 统计八字中五行数量 */
  private countWuXing(siZhu: any): Record<string, number> {
    const count: Record<string, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
    const pillars = [siZhu.year, siZhu.month, siZhu.day, siZhu.hour];
    for (const p of pillars) {
      const ganWx = GAN_WUXING[p.tianGan];
      const zhiWx = ZHI_WUXING[p.diZhi];
      if (ganWx) count[ganWx]++;
      if (zhiWx) count[zhiWx]++;
    }
    return count;
  }

  /** 找出五行缺失 */
  private findWuXingLack(count: Record<string, number>): string[] {
    return ['金', '木', '水', '火', '土'].filter((wx) => count[wx] === 0);
  }

  /** 判断身强身弱 */
  private judgeShenQiangRuo(
    riZhuWuXing: string,
    count: Record<string, number>,
  ): string {
    // 简化判断：日主五行 + 生日主的五行数量 vs 克泄耗
    const shengMap: Record<string, string> = {
      木: '水',
      火: '木',
      土: '火',
      金: '土',
      水: '金',
    };
    const shengWx = shengMap[riZhuWuXing] || '';
    const helpCount = (count[riZhuWuXing] || 0) + (count[shengWx] || 0);
    const total = Object.values(count).reduce((a, b) => a + b, 0);
    return helpCount >= total / 2 ? '身强' : '身弱';
  }

  /** 确定用神和忌神 */
  private determineYongJiShen(riZhuWuXing: string, shenQiangRuo: string) {
    // 身强需克泄耗，身弱需生扶
    const keMap: Record<string, string> = {
      木: '金',
      火: '水',
      土: '木',
      金: '火',
      水: '土',
    };
    const xieMap: Record<string, string> = {
      木: '火',
      火: '土',
      土: '金',
      金: '水',
      水: '木',
    };
    const shengMap: Record<string, string> = {
      木: '水',
      火: '木',
      土: '火',
      金: '土',
      水: '金',
    };

    if (shenQiangRuo === '身强') {
      return {
        yongShen: keMap[riZhuWuXing] || '金',
        jiShen: shengMap[riZhuWuXing] || '水',
      };
    } else {
      return {
        yongShen: shengMap[riZhuWuXing] || '水',
        jiShen: keMap[riZhuWuXing] || '金',
      };
    }
  }

  /** 判断格局 */
  private determineGeJu(siZhu: any, riZhu: string): string {
    const monthZhi = siZhu.month.diZhi;
    const monthGan = siZhu.month.tianGan;
    const shiShen = this.getShiShen(riZhu, monthGan);

    const geJuMap: Record<string, string> = {
      正官: '正官格',
      七杀: '七杀格',
      正印: '正印格',
      偏印: '偏印格',
      正财: '正财格',
      偏财: '偏财格',
      食神: '食神格',
      伤官: '伤官格',
      比肩: '比肩格',
      劫财: '劫财格',
    };
    return geJuMap[shiShen] || '普通格局';
  }

  /** 提取大运 */
  private extractDaYun(eightChar: any, gender: number): DaYunItem[] {
    try {
      const yun = eightChar.getYun(gender === 1 ? 1 : 0);
      const daYunList = yun.getDaYun();
      return daYunList.slice(1, 9).map((dy: any, idx: number) => ({
        startAge: dy.getStartAge(),
        endAge: dy.getEndAge(),
        tianGan: dy.getGanZhi()?.[0] || '',
        diZhi: dy.getGanZhi()?.[1] || '',
        wuXing: `${GAN_WUXING[dy.getGanZhi()?.[0]] || ''}${ZHI_WUXING[dy.getGanZhi()?.[1]] || ''}`,
      }));
    } catch (e) {
      this.logger.warn('大运计算异常，使用空列表', e);
      return [];
    }
  }
}
