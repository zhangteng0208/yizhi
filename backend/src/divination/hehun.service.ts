import { Injectable } from '@nestjs/common';
import { BaZiService, BaZiResult } from './bazi.service.js';

/** 天干五行 */
const GAN_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

/** 五行相生 */
const WUXING_SHENG: Record<string, string> = {
  '金': '水', '水': '木', '木': '火', '火': '土', '土': '金',
};

/** 五行相克 */
const WUXING_KE: Record<string, string> = {
  '金': '木', '木': '土', '土': '水', '水': '火', '火': '金',
};

/** 天干合 */
const TIANGAN_HE: [string, string][] = [
  ['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸'],
];

/** 六合 */
const LIUHE: [string, string][] = [
  ['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未'],
];

/** 三合 */
const SANHE: [string, string, string][] = [
  ['申', '子', '辰'], ['寅', '午', '戌'], ['巳', '酉', '丑'], ['亥', '卯', '未'],
];

/** 相冲 */
const XIANGCHONG: [string, string][] = [
  ['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
];

/** 相害 */
const XIANGHAI: [string, string][] = [
  ['子', '未'], ['丑', '午'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌'],
];

/** 相刑 */
const XIANGXING: [string, string][] = [
  ['寅', '巳'], ['巳', '申'], ['寅', '申'],
  ['丑', '戌'], ['戌', '未'], ['丑', '未'],
  ['子', '卯'], ['卯', '子'],
];

export interface PersonInput {
  name: string;
  gender: number;       // 1=male, 2=female
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: string;    // 地支，如 "寅"
}

export interface CompatibilityDimension {
  name: string;
  score: number;
  level: string;
  detail: string;
}

export interface HehunResult {
  male: { name: string; gender: number; bazi: BaZiResult };
  female: { name: string; gender: number; bazi: BaZiResult };
  overallScore: number;
  overallLevel: string;
  dimensions: {
    shuxiang: CompatibilityDimension;
    rigan: CompatibilityDimension;
    wuxing: CompatibilityDimension;
    nayin: CompatibilityDimension;
  };
}

function getLevel(score: number): string {
  if (score >= 90) return '上上';
  if (score >= 80) return '上';
  if (score >= 70) return '中上';
  if (score >= 60) return '中';
  if (score >= 50) return '中下';
  return '下';
}

function getOverallLevel(score: number): string {
  if (score >= 90) return '上上婚';
  if (score >= 80) return '上等婚';
  if (score >= 70) return '中上婚';
  if (score >= 60) return '中等婚';
  if (score >= 50) return '中下婚';
  return '下等婚';
}

function matchPair(a: string, b: string, pairs: [string, string][]): boolean {
  return pairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

function inSanhe(a: string, b: string): boolean {
  return SANHE.some(g => g.includes(a) && g.includes(b));
}

function extractNayinWuxing(nayin: string): string {
  const last = nayin.charAt(nayin.length - 1);
  if (['金', '木', '水', '火', '土'].includes(last)) return last;
  return '土';
}

@Injectable()
export class HehunService {
  constructor(private readonly baziService: BaZiService) {}

  calculate(male: PersonInput, female: PersonInput): HehunResult {
    const maleBazi = this.baziService.calculate(
      male.birthYear, male.birthMonth, male.birthDay,
      male.birthHour, 1, false,
    );
    const femaleBazi = this.baziService.calculate(
      female.birthYear, female.birthMonth, female.birthDay,
      female.birthHour, 2, false,
    );

    const shuxiang = this.scoreShuxiang(maleBazi, femaleBazi);
    const rigan = this.scoreRigan(maleBazi, femaleBazi);
    const wuxing = this.scoreWuxing(maleBazi, femaleBazi);
    const nayin = this.scoreNayin(maleBazi, femaleBazi);

    const overallScore = Math.round(
      shuxiang.score * 0.30 + rigan.score * 0.30 +
      wuxing.score * 0.25 + nayin.score * 0.15,
    );

    return {
      male: { name: male.name, gender: 1, bazi: maleBazi },
      female: { name: female.name, gender: 2, bazi: femaleBazi },
      overallScore: Math.max(0, Math.min(100, overallScore)),
      overallLevel: getOverallLevel(overallScore),
      dimensions: { shuxiang, rigan, wuxing, nayin },
    };
  }

  /** 属相配对 */
  private scoreShuxiang(m: BaZiResult, f: BaZiResult): CompatibilityDimension {
    const mZhi = m.siZhu.year.diZhi;
    const fZhi = f.siZhu.year.diZhi;
    const mSx = m.lunarInfo.shengXiao;
    const fSx = f.lunarInfo.shengXiao;
    let score: number;
    let detail: string;

    if (matchPair(mZhi, fZhi, LIUHE)) {
      score = 92;
      detail = `${mSx}与${fSx}为六合，天作之合，感情融洽。`;
    } else if (inSanhe(mZhi, fZhi)) {
      score = 85;
      detail = `${mSx}与${fSx}为三合，志趣相投，相处和谐。`;
    } else if (matchPair(mZhi, fZhi, XIANGCHONG)) {
      score = 30;
      detail = `${mSx}与${fSx}相冲，性格差异较大，需多包容。`;
    } else if (matchPair(mZhi, fZhi, XIANGHAI)) {
      score = 40;
      detail = `${mSx}与${fSx}相害，易生误解，需加强沟通。`;
    } else if (matchPair(mZhi, fZhi, XIANGXING)) {
      score = 35;
      detail = `${mSx}与${fSx}相刑，相处需注意方式方法。`;
    } else {
      score = 65;
      detail = `${mSx}与${fSx}无特殊冲合关系，平稳相处。`;
    }
    return { name: '属相配对', score, level: getLevel(score), detail };
  }

  /** 日干配合 */
  private scoreRigan(m: BaZiResult, f: BaZiResult): CompatibilityDimension {
    const mGan = m.siZhu.day.tianGan;
    const fGan = f.siZhu.day.tianGan;
    const mWx = GAN_WUXING[mGan] || '土';
    const fWx = GAN_WUXING[fGan] || '土';
    let score: number;
    let detail: string;

    if (TIANGAN_HE.some(([a, b]) => (mGan === a && fGan === b) || (mGan === b && fGan === a))) {
      score = 93;
      detail = `${mGan}${fGan}天干相合，夫妻缘分深厚，心意相通。`;
    } else if (WUXING_SHENG[mWx] === fWx) {
      score = 82;
      detail = `男方${mWx}生女方${fWx}，男方扶助女方，关系和顺。`;
    } else if (WUXING_SHENG[fWx] === mWx) {
      score = 80;
      detail = `女方${fWx}生男方${mWx}，女方助益男方，相辅相成。`;
    } else if (mWx === fWx) {
      score = 72;
      detail = `双方日干同属${mWx}，性格相近，比和之象。`;
    } else if (WUXING_KE[mWx] === fWx) {
      score = 45;
      detail = `男方${mWx}克女方${fWx}，男方较强势，需注意平衡。`;
    } else if (WUXING_KE[fWx] === mWx) {
      score = 42;
      detail = `女方${fWx}克男方${mWx}，女方较强势，需互相尊重。`;
    } else {
      score = 60;
      detail = `${mGan}与${fGan}五行关系平和。`;
    }
    return { name: '日干配合', score, level: getLevel(score), detail };
  }

  /** 五行互补 */
  private scoreWuxing(m: BaZiResult, f: BaZiResult): CompatibilityDimension {
    let score = 60;
    const buList: string[] = [];

    for (const wx of m.wuXingLack) {
      if ((f.wuXingCount[wx] || 0) >= 2) { score += 10; buList.push(`女方补男方${wx}`); }
      else if ((f.wuXingCount[wx] || 0) >= 1) { score += 5; buList.push(`女方略补男方${wx}`); }
    }
    for (const wx of f.wuXingLack) {
      if ((m.wuXingCount[wx] || 0) >= 2) { score += 10; buList.push(`男方补女方${wx}`); }
      else if ((m.wuXingCount[wx] || 0) >= 1) { score += 5; buList.push(`男方略补女方${wx}`); }
    }
    if ((m.wuXingCount[f.yongShen] || 0) >= 2) { score += 5; }
    if ((f.wuXingCount[m.yongShen] || 0) >= 2) { score += 5; }

    score = Math.min(98, score);
    const detail = buList.length > 0
      ? `五行互补良好：${buList.join('，')}。`
      : '双方五行各自完整，互补需求不大。';
    return { name: '五行互补', score, level: getLevel(score), detail };
  }

  /** 纳音配合 */
  private scoreNayin(m: BaZiResult, f: BaZiResult): CompatibilityDimension {
    const mNayin = m.siZhu.day.naYin;
    const fNayin = f.siZhu.day.naYin;
    const mWx = extractNayinWuxing(mNayin);
    const fWx = extractNayinWuxing(fNayin);
    let score: number;
    let detail: string;

    if (mNayin === fNayin) {
      score = 90;
      detail = `双方日柱纳音同为「${mNayin}」，天生默契。`;
    } else if (WUXING_SHENG[mWx] === fWx || WUXING_SHENG[fWx] === mWx) {
      score = 82;
      detail = `纳音${mNayin}（${mWx}）与${fNayin}（${fWx}）相生，气场和谐。`;
    } else if (mWx === fWx) {
      score = 70;
      detail = `纳音同属${mWx}，性情相近，比和之象。`;
    } else if (WUXING_KE[mWx] === fWx || WUXING_KE[fWx] === mWx) {
      score = 42;
      detail = `纳音${mNayin}（${mWx}）与${fNayin}（${fWx}）相克，需注意化解。`;
    } else {
      score = 60;
      detail = `纳音${mNayin}与${fNayin}关系平和。`;
    }
    return { name: '纳音配合', score, level: getLevel(score), detail };
  }
}
