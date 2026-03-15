import { Injectable } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar, Lunar } = require('lunar-javascript');

/** 事件类型与对应宜忌关键词 */
const EVENT_KEYWORDS: Record<string, string[]> = {
  hunyin: ['嫁娶', '结婚', '订婚', '订盟', '纳采'],
  banqian: ['搬家', '移徙', '入宅'],
  kaizhang: ['开业', '开张', '开市', '交易'],
  zhuangxiu: ['装修', '修造', '动土'],
  chuxing: ['出行', '远行'],
  qiche: ['提车', '纳财', '交易'],
  ruxue: ['入学', '求学'],
  kaigong: ['动工', '破土', '动土'],
  jiehun: ['嫁娶', '结婚'],
  lingzheng: ['领证', '嫁娶', '订盟'],
  anzang: ['安葬', '破土'],
  jisi: ['祭祀', '祈福'],
  qiuyi: ['求医', '治病'],
  other: [],
};

/** 十二建星 */
const JIAN_XING = [
  '建',
  '除',
  '满',
  '平',
  '定',
  '执',
  '破',
  '危',
  '成',
  '收',
  '开',
  '闭',
];
/** 黄道日（吉）：除、危、定、执、成、开 */
const HUANG_DAO = ['除', '危', '定', '执', '成', '开'];
/** 黑道日（凶）：建、满、平、破、收、闭 */
// const HEI_DAO = ['建', '满', '平', '破', '收', '闭'];

/** 十二建星吉凶等级 */
const JIAN_XING_LEVEL: Record<string, number> = {
  成: 5,
  开: 5,
  定: 4,
  除: 4,
  危: 3,
  执: 3,
  建: 2,
  满: 2,
  平: 2,
  收: 2,
  闭: 1,
  破: 1,
};

export interface DayInfo {
  date: string; // yyyy-MM-dd
  lunarDate: string; // 农历日期
  lunarMonth: string; // 农历月
  lunarDay: string; // 农历日
  weekday: string; // 星期
  ganzhi: string; // 日干支
  jianXing: string; // 十二建星
  isHuangDao: boolean; // 是否黄道日
  yi: string[]; // 宜
  ji: string[]; // 忌
  score: number; // 综合评分 0-100
  matchEvent: boolean; // 是否匹配所选事件
  chongSha: string; // 冲煞
  jieqi: string; // 节气（如有）
}

export interface ZejiResult {
  eventType: string;
  eventName: string;
  startDate: string;
  endDate: string;
  days: DayInfo[];
  bestDays: DayInfo[];
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const EVENT_NAMES: Record<string, string> = {
  hunyin: '婚嫁',
  banqian: '搬家',
  kaizhang: '开业',
  zhuangxiu: '装修',
  chuxing: '出行',
  qiche: '提车',
  ruxue: '入学',
  kaigong: '动工',
  jiehun: '结婚',
  lingzheng: '领证',
  anzang: '安葬',
  jisi: '祭祀',
  qiuyi: '求医',
  other: '综合择吉',
};

@Injectable()
export class ZejiService {
  /**
   * 择日择吉
   * @param eventType 事件类型
   * @param startDate 起始日期 yyyy-MM-dd
   * @param endDate 结束日期 yyyy-MM-dd
   */
  calculate(eventType: string, startDate: string, endDate: string): ZejiResult {
    const keywords = EVENT_KEYWORDS[eventType] || [];
    const days: DayInfo[] = [];

    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    // 限制最多查询90天
    const maxDays = 90;
    let count = 0;

    const current = new Date(start);
    while (current <= end && count < maxDays) {
      const dayInfo = this.analyzDay(current, keywords);
      days.push(dayInfo);
      current.setDate(current.getDate() + 1);
      count++;
    }

    // 筛选最佳吉日：匹配事件 + 黄道日 + 高分，取前10
    const bestDays = days
      .filter((d) => d.matchEvent && d.isHuangDao && d.score >= 60)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return {
      eventType,
      eventName: EVENT_NAMES[eventType] || '综合择吉',
      startDate,
      endDate,
      days,
      bestDays,
    };
  }

  private analyzDay(date: Date, eventKeywords: string[]): DayInfo {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const solar = Solar.fromYmd(y, m, d);
    const lunar = solar.getLunar();

    const yi: string[] = lunar.getDayYi();
    const ji: string[] = lunar.getDayJi();
    const ganzhi = lunar.getDayInGanZhi();
    const jianXingRaw = lunar.getZhiXing(); // 十二建星
    const jianXing = jianXingRaw.replace('日', '');
    const isHuangDao = HUANG_DAO.includes(jianXing);
    const chong = lunar.getDayChongDesc();
    const sha = lunar.getDaySha();
    const jieqi = lunar.getCurrentJieQi()?.getName() || '';

    // 是否匹配事件
    const matchEvent =
      eventKeywords.length === 0 || eventKeywords.some((kw) => yi.includes(kw));

    // 综合评分
    let score = 50;
    // 黄道日加分
    if (isHuangDao) score += 20;
    // 建星等级加分
    score += (JIAN_XING_LEVEL[jianXing] || 0) * 4;
    // 匹配事件加分
    if (matchEvent && eventKeywords.length > 0) score += 15;
    // 忌中包含事件关键词扣分
    if (eventKeywords.some((kw) => ji.includes(kw))) score -= 30;
    // 破日大凶
    if (jianXing === '破') score -= 20;

    score = Math.max(0, Math.min(100, score));

    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const weekday = `星期${WEEKDAYS[date.getDay()]}`;

    return {
      date: dateStr,
      lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      lunarMonth: lunar.getMonthInChinese(),
      lunarDay: lunar.getDayInChinese(),
      weekday,
      ganzhi,
      jianXing,
      isHuangDao,
      yi,
      ji,
      score,
      matchEvent,
      chongSha: `冲${chong} 煞${sha}`,
      jieqi,
    };
  }

  private parseDate(str: string): Date {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
}
