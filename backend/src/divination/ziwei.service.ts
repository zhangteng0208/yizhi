import { Injectable, Logger } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { astro } = require('iztro');

export interface ZiweiPalace {
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: { name: string; brightness: string }[];
  minorStars: string[];
  decadal: { range: number[]; heavenlyStem: string; earthlyBranch: string };
}

export interface ZiweiResult {
  /** 基本信息 */
  solarDate: string;
  lunarDate: string;
  gender: string;
  zodiac: string;
  sign: string;
  /** 命主星 */
  soul: string;
  /** 身主星 */
  body: string;
  /** 五行局 */
  fiveElementsClass: string;
  /** 命宫地支 */
  earthlyBranchOfSoulPalace: string;
  /** 身宫地支 */
  earthlyBranchOfBodyPalace: string;
  /** 十二宫 */
  palaces: ZiweiPalace[];
  /** 命宫主星 */
  mingMainStar: string;
}

@Injectable()
export class ZiweiService {
  private readonly logger = new Logger(ZiweiService.name);

  /**
   * 紫微斗数排盘
   * @param year 出生年
   * @param month 出生月
   * @param day 出生日
   * @param hour 时辰索引 0-12（子0 丑1 寅2 ...）
   * @param gender 1=男 2=女
   * @param isLunar 是否农历
   */
  calculate(
    year: number,
    month: number,
    day: number,
    hour: number,
    gender: number,
    isLunar: boolean = false,
  ): ZiweiResult {
    const dateStr = `${year}-${month}-${day}`;
    const genderStr = gender === 1 ? '男' : '女';

    let result: any;
    if (isLunar) {
      result = astro.astrolabeByLunarDate(dateStr, hour, genderStr);
    } else {
      result = astro.astrolabeBySolarDate(dateStr, hour, genderStr);
    }

    const palaces: ZiweiPalace[] = result.palaces.map((p: any) => ({
      name: p.name,
      heavenlyStem: p.heavenlyStem,
      earthlyBranch: p.earthlyBranch,
      majorStars: p.majorStars.map((s: any) => ({
        name: s.name,
        brightness: s.brightness || '',
      })),
      minorStars: p.minorStars.map((s: any) => s.name),
      decadal: p.decadal,
    }));

    // 命宫主星
    const mingPalace = palaces.find(p => p.name === '命宫');
    const mingMainStar = mingPalace?.majorStars.map(s => s.name).join('、') || '无主星';

    return {
      solarDate: result.solarDate,
      lunarDate: result.lunarDate,
      gender: genderStr,
      zodiac: result.zodiac,
      sign: result.sign,
      soul: result.soul,
      body: result.body,
      fiveElementsClass: result.fiveElementsClass,
      earthlyBranchOfSoulPalace: result.earthlyBranchOfSoulPalace,
      earthlyBranchOfBodyPalace: result.earthlyBranchOfBodyPalace,
      palaces,
      mingMainStar,
    };
  }
}
