import { Injectable, Logger } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { QimenChart } = require('3meta');

export interface QimenPalace {
  position: number;
  trigram: string;
  heavenlyStem: string;
  earthlyStem: string;
  star: string;
  gate: string;
  deity: string;
  fiveElements: string;
  isZhiFu: boolean;
  isZhiShi: boolean;
  starStatus: string;
  gateStatus: string;
  innerOuter: string;
  gatePressure: string;
}

export interface QimenResult {
  /** 局 */
  ju: { type: string; number: number };
  /** 元 */
  yuan: string;
  /** 值符 */
  zhiFu: { star: string; position: number; heavenlyStem: string };
  /** 值使 */
  zhiShi: { gate: string; position: number };
  /** 驿马 */
  postHorse: { branch: string; position: string };
  /** 四柱 */
  fourPillars: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    hour: { stem: string; branch: string };
  };
  /** 时间信息 */
  timeInfo: {
    solarDate: string;
    lunarDate: string;
    solarTerm: string;
    timeName: string;
    xunShou: string;
    voidness: string[];
  };
  /** 九宫 */
  palaces: QimenPalace[];
  /** 吉格 */
  auspicious: {
    name: string;
    type: string;
    position: number;
    description: string;
  }[];
  /** 凶格 */
  inauspicious: {
    name: string;
    type: string;
    position: number;
    description: string;
  }[];
}

@Injectable()
export class QimenService {
  private readonly logger = new Logger(QimenService.name);

  /**
   * 奇门遁甲排盘
   * @param dateStr 日期时间字符串 如 '1988-02-08 04:00:00'
   */
  calculate(dateStr: string): QimenResult {
    const chart = QimenChart.byDatetime(dateStr);

    const palaces: QimenPalace[] = chart.palaces.map((p: any) => ({
      position: p.position,
      trigram: p.trigram,
      heavenlyStem: Array.isArray(p.heavenlyStem)
        ? p.heavenlyStem.join(' ')
        : p.heavenlyStem,
      earthlyStem: Array.isArray(p.earthlyStem)
        ? p.earthlyStem.join(' ')
        : p.earthlyStem,
      star: p.star,
      gate: p.gate,
      deity: p.deity,
      fiveElements: p.fiveElements,
      isZhiFu: p.isZhiFu,
      isZhiShi: p.isZhiShi,
      starStatus: p.status?.star || '',
      gateStatus: p.status?.gate || '',
      innerOuter: p.innerOuter || '',
      gatePressure: p.gatePressure || '无',
    }));

    const sp = chart.specialPatterns || {};
    const auspicious = (sp.auspiciousPatterns || []).map((a: any) => ({
      name: a.name,
      type: a.type,
      position: a.position,
      description: a.description,
    }));
    const inauspicious = (sp.inauspiciousPatterns || []).map((a: any) => ({
      name: a.name,
      type: a.type,
      position: a.position,
      description: a.description,
    }));

    return {
      ju: chart.ju,
      yuan: chart.yuan,
      zhiFu: {
        ...chart.zhiFu,
        heavenlyStem: Array.isArray(chart.zhiFu?.heavenlyStem)
          ? chart.zhiFu.heavenlyStem.join(' ')
          : chart.zhiFu?.heavenlyStem,
      },
      zhiShi: chart.zhiShi,
      postHorse: chart.postHorse,
      fourPillars: chart.fourPillars,
      timeInfo: {
        solarDate: chart.timeInfo?.solarDate,
        lunarDate: chart.timeInfo?.lunarDate,
        solarTerm: chart.timeInfo?.solarTerm,
        timeName: chart.timeInfo?.timeName,
        xunShou: chart.timeInfo?.xunShou,
        voidness: chart.timeInfo?.voidness || [],
      },
      palaces,
      auspicious,
      inauspicious,
    };
  }
}
