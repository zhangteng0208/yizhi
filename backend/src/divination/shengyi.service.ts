import { Injectable, Logger } from '@nestjs/common';
import { BaZiService, BaZiResult } from './bazi.service.js';
import { YijingService, YijingResult } from './yijing.service.js';

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

/** 行业与五行对应 */
const INDUSTRY_WUXING: Record<string, string> = {
  '科技': '木',    // 互联网、软件、科技创新 - 木性生发
  '金融': '水',    // 银行、保险、投资 - 水性流动
  '制造': '土',    // 制造业、房地产、建筑 - 土性厚重
  '能源': '火',    // 电力、能源、煤炭 - 火性热烈
  '医疗': '金',    // 医疗器械、医药 - 金性刚毅
  '教育': '火',    // 教育培训 - 火性文明
  '餐饮': '火',    // 餐饮 - 火性烹饪
  '贸易': '金',    // 国际贸易、零售 - 金性果断
  '农业': '土',    // 农业 - 土性生长
  '传媒': '木',    // 传媒、广告 - 木性传播
  '咨询': '水',    // 咨询、顾问 - 水性智慧
  '物流': '水',    // 物流、运输 - 水性流通
  '娱乐': '火',    // 娱乐、演艺 - 火性热烈
  '服务': '土',    // 服务业 - 土性承载
  '其他': '土',    // 其他行业
};

/** 行业列表 */
export const INDUSTRY_LIST = [
  { value: '科技', label: '科技/互联网', icon: '💻' },
  { value: '金融', label: '金融/投资', icon: '💰' },
  { value: '制造', label: '制造/建筑', icon: '🏭' },
  { value: '能源', label: '能源/电力', icon: '⚡' },
  { value: '医疗', label: '医疗/医药', icon: '🏥' },
  { value: '教育', label: '教育培训', icon: '📚' },
  { value: '餐饮', label: '餐饮/食品', icon: '🍜' },
  { value: '贸易', label: '贸易/零售', icon: '🛒' },
  { value: '农业', label: '农业', icon: '🌾' },
  { value: '传媒', label: '传媒/广告', icon: '📺' },
  { value: '咨询', label: '咨询/顾问', icon: '💼' },
  { value: '物流', label: '物流/运输', icon: '🚚' },
  { value: '娱乐', label: '娱乐/演艺', icon: '🎭' },
  { value: '服务', label: '服务业', icon: '🤝' },
  { value: '其他', label: '其他', icon: '📦' },
];

export interface PartnerInput {
  name: string;
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

export interface PartnershipResult {
  self: { name: string; bazi: BaZiResult };
  partners: { name: string; bazi: BaZiResult }[];
  industry: string;
  industryWuXing: string;
  yijing: YijingResult;
  overallScore: number;
  overallLevel: string;
  recommendation: string;
  dimensions: {
    wuxingMatch: CompatibilityDimension;
    baziHarmony: CompatibilityDimension;
    industrySuitability: CompatibilityDimension;
    leadershipBalance: CompatibilityDimension;
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
  if (score >= 90) return '上上合作';
  if (score >= 80) return '上等合作';
  if (score >= 70) return '中上合作';
  if (score >= 60) return '中等合作';
  if (score >= 50) return '中下合作';
  return '不建议合作';
}

@Injectable()
export class ShengyiService {
  private readonly logger = new Logger(ShengyiService.name);

  constructor(
    private readonly baziService: BaZiService,
    private readonly yijingService: YijingService,
  ) {}

  calculate(
    self: PartnerInput,
    partners: PartnerInput[],
    industry: string,
  ): PartnershipResult {
    // 1. 计算自己的八字
    const selfBazi = this.baziService.calculate(
      self.birthYear, self.birthMonth, self.birthDay,
      self.birthHour, 1, false, // 默认男
    );

    // 2. 计算每个合伙人的八字
    const partnerBazis = partners.map(p => ({
      name: p.name,
      bazi: this.baziService.calculate(
        p.birthYear, p.birthMonth, p.birthDay,
        p.birthHour, 2, false, // 默认女，实际用性别影响不大
      ),
    }));

    // 3. 易经起卦
    const yijing = this.yijingService.calculate();

    // 4. 行业五行
    const industryWuXing = INDUSTRY_WUXING[industry] || '土';

    // 5. 计算各个维度
    const wuxingMatch = this.scoreWuXingMatch(selfBazi, partnerBazis);
    const baziHarmony = this.scoreBaziHarmony(selfBazi, partnerBazis);
    const industrySuitability = this.scoreIndustrySuitability(selfBazi, partnerBazis, industry, industryWuXing);
    const leadershipBalance = this.scoreLeadershipBalance(selfBazi, partnerBazis);

    // 6. 计算总分
    const overallScore = Math.round(
      wuxingMatch.score * 0.25 +
      baziHarmony.score * 0.30 +
      industrySuitability.score * 0.25 +
      leadershipBalance.score * 0.20
    );

    // 7. 生成建议
    const recommendation = this.generateRecommendation(
      self, partnerBazis, industry, industryWuXing,
      overallScore, wuxingMatch, baziHarmony, industrySuitability, leadershipBalance
    );

    return {
      self: { name: self.name, bazi: selfBazi },
      partners: partnerBazis,
      industry,
      industryWuXing,
      yijing,
      overallScore: Math.max(0, Math.min(100, overallScore)),
      overallLevel: getOverallLevel(overallScore),
      recommendation,
      dimensions: { wuxingMatch, baziHarmony, industrySuitability, leadershipBalance },
    };
  }

  /** 五行匹配度分析 */
  private scoreWuXingMatch(self: BaZiResult, partners: { name: string; bazi: BaZiResult }[]): CompatibilityDimension {
    let totalScore = 0;
    const details: string[] = [];

    for (const partner of partners) {
      // 统计合伙人的五行
      const partnerWx = partner.bazi.wuXingCount;
      const selfWx = self.wuXingCount;

      // 检查互补
      let score = 60; // 基础分

      // 自己的用神被合伙人补
      if (partnerWx[self.yongShen] && partnerWx[self.yongShen] >= 1) {
        score += 15;
        details.push(`合伙人补甲方用神${self.yongShen}`);
      }

      // 合伙人用神被自己补
      if (selfWx[partner.bazi.yongShen] && selfWx[partner.bazi.yongShen] >= 1) {
        score += 10;
        details.push(`甲方补合伙人用神${partner.bazi.yongShen}`);
      }

      // 五行相生加分
      const selfRiWx = GAN_WUXING[self.siZhu.day.tianGan] || '土';
      const partnerRiWx = GAN_WUXING[partner.bazi.siZhu.day.tianGan] || '土';

      if (WUXING_SHENG[selfRiWx] === partnerRiWx) {
        score += 10;
        details.push('日主五行相生');
      }

      // 同五行加分
      if (selfRiWx === partnerRiWx) {
        score += 5;
        details.push('日主五行比和');
      }

      // 检查忌神被克
      if (WUXING_KE[partner.bazi.jiShen] === self.jiShen) {
        score += 5;
        details.push('忌神相互制约');
      }

      totalScore += Math.min(95, score);
    }

    const avgScore = Math.round(totalScore / partners.length);

    return {
      name: '五行匹配',
      score: avgScore,
      level: getLevel(avgScore),
      detail: details.length > 0 ? details.join('，') : '五行关系平和',
    };
  }

  /** 八字和谐度分析 */
  private scoreBaziHarmony(self: BaZiResult, partners: { name: string; bazi: BaZiResult }[]): CompatibilityDimension {
    let totalScore = 0;
    const details: string[] = [];

    for (const partner of partners) {
      let score = 50; // 基础分

      // 属相合
      const selfZhi = self.siZhu.year.diZhi;
      const partnerZhi = partner.bazi.siZhu.year.diZhi;

      const liuhe = [['子','丑'], ['寅','亥'], ['卯','戌'], ['辰','酉'], ['巳','申'], ['午','未']];
      const sanhe = [['申','子','辰'], ['寅','午','戌'], ['巳','酉','丑'], ['亥','卯','未']];
      const xiangchong = [['子','午'], ['丑','未'], ['寅','申'], ['卯','酉'], ['辰','戌'], ['巳','亥']];

      if (liuhe.some(([a,b]) => (a===selfZhi && b===partnerZhi) || (a===partnerZhi && b===selfZhi))) {
        score += 25;
        details.push('属相六合');
      } else if (sanhe.some(g => g.includes(selfZhi) && g.includes(partnerZhi))) {
        score += 20;
        details.push('属相三合');
      } else if (xiangchong.some(([a,b]) => (a===selfZhi && b===partnerZhi) || (a===partnerZhi && b===selfZhi))) {
        score -= 15;
        details.push('属相相冲');
      }

      // 天干合
      const selfGan = self.siZhu.day.tianGan;
      const partnerGan = partner.bazi.siZhu.day.tianGan;
      const tianganhe = [['甲','己'], ['乙','庚'], ['丙','辛'], ['丁','壬'], ['戊','癸']];

      if (tianganhe.some(([a,b]) => (a===selfGan && b===partnerGan) || (a===partnerGan && b===selfGan))) {
        score += 15;
        details.push('天干五合');
      }

      // 日主关系
      const selfRi = self.siZhu.day.tianGan;
      const partnerRi = partner.bazi.siZhu.day.tianGan;
      const selfGanIdx = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(selfRi);
      const partnerGanIdx = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(partnerRi);

      // 比肩/劫财 - 合作
      if (selfRi === partnerRi) {
        score += 10;
        details.push('日主相同，比肩相帮');
      } else if (Math.abs(selfGanIdx - partnerGanIdx) === 5) { // 相邻天干
        score += 5;
        details.push('天干相邻');
      }

      // 身强身弱配合
      if (self.shenQiangRuo === '身强' && partner.bazi.shenQiangRuo === '身弱') {
        score += 10;
        details.push('强弱互补');
      } else if (self.shenQiangRuo === partner.bazi.shenQiangRuo) {
        score += 5;
        details.push('身强弱一致');
      }

      totalScore += Math.min(95, Math.max(20, score));
    }

    const avgScore = Math.round(totalScore / partners.length);

    return {
      name: '八字和谐',
      score: avgScore,
      level: getLevel(avgScore),
      detail: details.length > 0 ? details.join('，') : '八字关系平和',
    };
  }

  /** 行业适合度分析 */
  private scoreIndustrySuitability(
    self: BaZiResult,
    partners: { name: string; bazi: BaZiResult }[],
    industry: string,
    industryWuXing: string
  ): CompatibilityDimension {
    let score = 50;
    const details: string[] = [];

    // 自身适合度
    const selfRiWx = GAN_WUXING[self.siZhu.day.tianGan] || '土';

    // 行业五行生身
    if (WUXING_SHENG[industryWuXing] === selfRiWx || industryWuXing === selfRiWx) {
      score += 15;
      details.push(`行业${industryWuXing}生助日主${selfRiWx}`);
    } else if (WUXING_KE[industryWuXing] === selfRiWx) {
      score -= 10;
      details.push(`行业${industryWuXing}克日主${selfRiWx}`);
    }

    // 用神与行业
    if (self.yongShen === industryWuXing || WUXING_SHENG[industryWuXing] === self.yongShen) {
      score += 15;
      details.push('用神得行业五行助力');
    }

    // 合伙人整体配合
    let partnerSupport = 0;
    for (const partner of partners) {
      const partnerRiWx = GAN_WUXING[partner.bazi.siZhu.day.tianGan] || '土';
      if (WUXING_SHENG[partnerRiWx] === industryWuXing || industryWuXing === partnerRiWx) {
        partnerSupport += 10;
      }
    }
    score += Math.min(15, partnerSupport);
    if (partnerSupport > 0) {
      details.push('合伙人五行助益行业');
    }

    // 检查是否有多人忌神一致（不利）
    const jiShens = partners.map(p => p.bazi.jiShen);
    if (jiShens.every(j => j === jiShens[0]) && jiShens[0] === industryWuXing) {
      score -= 10;
      details.push('多人忌神与行业五行冲突');
    }

    score = Math.min(95, Math.max(25, score));

    return {
      name: '行业适合',
      score,
      level: getLevel(score),
      detail: details.length > 0 ? details.join('，') : '行业适合度一般',
    };
  }

  /** 领导力平衡分析 */
  private scoreLeadershipBalance(self: BaZiResult, partners: { name: string; bazi: BaZiResult }[]): CompatibilityDimension {
    let score = 60;
    const details: string[] = [];

    // 判断各自的身强身弱（领导力）
    const selfStrong = self.shenQiangRuo === '身强';
    const partnerStrengths = partners.map(p => p.bazi.shenQiangRuo === '身强');

    // 统计强弱
    const strongCount = (selfStrong ? 1 : 0) + partnerStrengths.filter(s => s).length;
    const totalCount = partners.length + 1;

    if (strongCount === 0) {
      score -= 20;
      details.push('全员身弱，缺乏主见');
    } else if (strongCount === 1) {
      score += 20;
      details.push('一人主导，其他配合');
    } else if (strongCount === totalCount) {
      score -= 15;
      details.push('都身强，可能争权');
    } else {
      score += 10;
      details.push('强弱搭配，互补平衡');
    }

    // 检查格局冲突
    const selfGeJu = self.geJu;
    const partnerGeJus = partners.map(p => p.bazi.geJu);

    // 如果有相同的权威格局，可能有冲突
    const authorityGees = ['正官格', '七杀格', '正财格', '偏财格'];
    const selfAuth = authorityGees.includes(selfGeJu);
    const partnerAuthCount = partnerGeJus.filter(g => authorityGees.includes(g)).length;

    if (selfAuth && partnerAuthCount > 0) {
      score -= 5 * partnerAuthCount;
      details.push('多人都带权威格局，需注意分工');
    }

    // 检查是否有共同的忌神（容易产生矛盾）
    const selfJiShen = self.jiShen;
    const partnerHasJiShen = partners.some(p => p.bazi.jiShen === selfJiShen);
    if (partnerHasJiShen) {
      score -= 10;
      details.push('忌神相同，易生嫌隙');
    }

    score = Math.min(95, Math.max(25, score));

    return {
      name: '领导平衡',
      score,
      level: getLevel(score),
      detail: details.length > 0 ? details.join('，') : '领导力平衡一般',
    };
  }

  /** 生成综合建议 */
  private generateRecommendation(
    self: PartnerInput,
    partners: { name: string; bazi: BaZiResult }[],
    industry: string,
    industryWuXing: string,
    overallScore: number,
    wuxingMatch: CompatibilityDimension,
    baziHarmony: CompatibilityDimension,
    industrySuitability: CompatibilityDimension,
    leadershipBalance: CompatibilityDimension
  ): string {
    const parts: string[] = [];

    // 整体评价
    if (overallScore >= 80) {
      parts.push(`「${self.name}」与${partners.map(p => p.name).join('、')}的生意合伙为上等合作，适合共同发展${industry}行业。`);
    } else if (overallScore >= 60) {
      parts.push(`「${self.name}」与${partners.map(p => p.name).join('、')}的合伙为中等合作，可尝试${industry}行业但需注意互补。`);
    } else {
      parts.push(`「${self.name}」与${partners.map(p => p.name).join('、')}的合伙存在较大挑战，建议谨慎合作或寻找其他合伙人。`);
    }

    // 关键建议
    if (wuxingMatch.score < 60) {
      const suggestions = partners.map((p, i) => {
        const 互补五行 = GAN_WUXING[p.bazi.yongShen] || p.bazi.yongShen;
        return `${p.name}宜补${p.bazi.yongShen}（${互补五行}）`;
      });
      parts.push(`五行调整：${suggestions.join('，')}。`);
    }

    if (industrySuitability.score < 60) {
      parts.push(`行业建议：${industry}（${industryWuXing}）与合伙人五行有一定冲克，可考虑五行属木或属火的行业。`);
    }

    if (leadershipBalance.score < 50) {
      parts.push(`领导分工：建议明确分工，避免权力过度分散或集中。`);
    }

    if (baziHarmony.score >= 80) {
      parts.push(`八字缘分深厚，双方属相、日干相合，是天然的生意伙伴。`);
    }

    // 易经建议
    parts.push(`易经卦象提示：${partners.length > 1 ? '多人合作' : '双人合伙'}宜「和气生财」，保持沟通与信任。`);

    return parts.join(' ');
  }
}
