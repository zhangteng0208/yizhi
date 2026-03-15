import { Injectable, Logger } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildLiuyao, generateSixNumbers } = require('cantian-liuyao');

export interface LiuyaoGua {
  name: string;
  gua: string;
  symbol: string;
  sequence: number;
  wuxing: string;
  shi: number;
  ying: number;
  judgement: string;
  text: string;
  ganzhi: string[];
  relation: string[];
  lineTexts: { label: string; text: string }[];
  upper: { name: string; nick: string; wuxing: string; symbol: string };
  lower: { name: string; nick: string; wuxing: string; symbol: string };
}

export interface LiuyaoResult {
  /** 摇卦数 */
  numbers: number[];
  /** 本卦 */
  origin: LiuyaoGua;
  /** 变卦 */
  changed: LiuyaoGua | null;
  /** 动爻索引（0-5） */
  movingIndexes: number[];
  /** 六神 */
  gods: string[];
  /** 排卦时间 */
  timeGanzhi: string;
}

@Injectable()
export class LiuyaoService {
  private readonly logger = new Logger(LiuyaoService.name);

  /**
   * 六爻排卦
   * @param numbers 可选，6个数字(6-9)，不传则随机摇卦
   */
  calculate(numbers?: number[]): LiuyaoResult {
    const nums =
      numbers && numbers.length === 6 ? numbers : generateSixNumbers();
    const now = new Date();
    const raw = buildLiuyao(nums, {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
    });

    return {
      numbers: nums,
      origin: this.mapGua(raw.origin),
      changed: raw.changed ? this.mapGua(raw.changed) : null,
      movingIndexes: raw.movingIndexes || [],
      gods: raw.gods || [],
      timeGanzhi: raw.timeGanzhi || '',
    };
  }

  private mapGua(g: any): LiuyaoGua {
    return {
      name: g.name,
      gua: g.gua,
      symbol: g.symbol,
      sequence: g.sequence,
      wuxing: g.wuxing,
      shi: g.shi,
      ying: g.ying,
      judgement: g.judgement,
      text: g.text,
      ganzhi: g.ganzhi || [],
      relation: g.relation || [],
      lineTexts: g.lineTexts || [],
      upper: g.upper,
      lower: g.lower,
    };
  }
}
