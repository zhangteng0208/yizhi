import { Injectable } from '@nestjs/common';

/** 六神定义 */
const LIU_SHEN = [
  {
    name: '大安',
    wuxing: '木',
    direction: '东方',
    desc: '身不动时，五行属木，颜色青色，方位东方。临青龙，谋事主一、五、七。有静止、心安、吉祥之含义。',
    poem: '大安事事昌，求财在坤方，失物去不远，宅舍保安康。行人身未动，病者主无妨，将军回田野，仔细更推详。',
  },
  {
    name: '留连',
    wuxing: '水',
    direction: '北方',
    desc: '人未归时，五行属水，颜色黑色，方位北方。临玄武，谋事主二、八、十。有暗昧不明、延迟、纠缠、拖延之含义。',
    poem: '留连事难成，求谋日未明，官事凡宜缓，去者未回程。失物南方见，急讨方心称，更须防口舌，人口且平平。',
  },
  {
    name: '速喜',
    wuxing: '火',
    direction: '南方',
    desc: '人即至时，五行属火，颜色红色，方位南方。临朱雀，谋事主三、六、九。有快速、喜庆、吉利之含义。',
    poem: '速喜喜来临，求财向南行，失物申未午，逢人路上寻。官事有福德，病者无祸侵，田宅六畜吉，行人有信音。',
  },
  {
    name: '赤口',
    wuxing: '金',
    direction: '西方',
    desc: '官事凶时，五行属金，颜色白色，方位西方。临白虎，谋事主四、七、十。有不吉、惊恐、凶险、口舌是非之含义。',
    poem: '赤口主口舌，官非切宜防，失物速速讨，行人有惊慌。六畜多作怪，病者出西方，更须防咒咀，诚恐染瘟殃。',
  },
  {
    name: '小吉',
    wuxing: '水',
    direction: '北方',
    desc: '人来喜时，五行属水，颜色黑色，方位北方（一说西南）。临六合，谋事主一、五、七。有和合、吉利之含义。',
    poem: '小吉最吉昌，路上好商量，阴人来报喜，失物在坤方。行人即便至，交关甚是强，凡事皆和合，病者叩穹苍。',
  },
  {
    name: '空亡',
    wuxing: '土',
    direction: '中央',
    desc: '音信稀时，五行属土，颜色黄色，方位中央。临勾陈，谋事主三、六、九。有不吉、无结果、忧虑之含义。',
    poem: '空亡事不祥，阴人多乖张，求财无利益，行人有灾殃。失物寻不见，官事有刑伤，病人逢暗鬼，解禳保安康。',
  },
];

/** 农历月份名 */
const LUNAR_MONTHS = [
  '正月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '冬月',
  '腊月',
];
const LUNAR_DAYS = [
  '初一',
  '初二',
  '初三',
  '初四',
  '初五',
  '初六',
  '初七',
  '初八',
  '初九',
  '初十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
  '十九',
  '二十',
  '廿一',
  '廿二',
  '廿三',
  '廿四',
  '廿五',
  '廿六',
  '廿七',
  '廿八',
  '廿九',
  '三十',
];
const SHICHEN = [
  '子时',
  '丑时',
  '寅时',
  '卯时',
  '辰时',
  '巳时',
  '午时',
  '未时',
  '申时',
  '酉时',
  '戌时',
  '亥时',
];

export interface XiaoliurenResult {
  question: string;
  lunarMonth: number;
  lunarDay: number;
  shichen: number;
  lunarMonthName: string;
  lunarDayName: string;
  shichenName: string;
  monthShen: {
    name: string;
    wuxing: string;
    direction: string;
    desc: string;
    poem: string;
    index: number;
  };
  dayShen: {
    name: string;
    wuxing: string;
    direction: string;
    desc: string;
    poem: string;
    index: number;
  };
  hourShen: {
    name: string;
    wuxing: string;
    direction: string;
    desc: string;
    poem: string;
    index: number;
  };
  jixiong: string;
}

@Injectable()
export class XiaoliurenService {
  /**
   * 小六壬起卦
   * @param lunarMonth 农历月份 1-12
   * @param lunarDay 农历日 1-30
   * @param shichen 时辰 0-11 (子丑寅卯辰巳午未申酉戌亥)
   * @param question 所问之事
   * @param customNumbers 自定义三个数字 [n1, n2, n3]，每个数字对应六神索引
   */
  calculate(
    lunarMonth: number,
    lunarDay: number,
    shichen: number,
    question: string,
    customNumbers?: number[],
  ): XiaoliurenResult {
    let monthIndex: number, dayIndex: number, hourIndex: number;

    if (customNumbers && customNumbers.length === 3) {
      // 自定义起卦：三个数字分别对应三宫六神
      monthIndex = (((customNumbers[0] - 1) % 6) + 6) % 6;
      dayIndex = (((customNumbers[1] - 1) % 6) + 6) % 6;
      hourIndex = (((customNumbers[2] - 1) % 6) + 6) % 6;
    } else {
      // 传统起卦：月上起日，日上起时
      monthIndex = (lunarMonth - 1) % 6;
      dayIndex = (monthIndex + lunarDay - 1) % 6;
      hourIndex = (dayIndex + shichen) % 6;
    }

    const monthShen = LIU_SHEN[monthIndex];
    const dayShen = LIU_SHEN[dayIndex];
    const hourShen = LIU_SHEN[hourIndex];

    const jixiong = this.judgeJixiong(
      monthShen.name,
      dayShen.name,
      hourShen.name,
    );

    return {
      question,
      lunarMonth,
      lunarDay,
      shichen,
      lunarMonthName: LUNAR_MONTHS[lunarMonth - 1] || `${lunarMonth}月`,
      lunarDayName: LUNAR_DAYS[lunarDay - 1] || `${lunarDay}日`,
      shichenName: SHICHEN[shichen] || `${shichen}时`,
      monthShen: { ...monthShen, index: monthIndex },
      dayShen: { ...dayShen, index: dayIndex },
      hourShen: { ...hourShen, index: hourIndex },
      jixiong,
    };
  }

  private judgeJixiong(month: string, day: string, hour: string): string {
    const ji = ['大安', '速喜', '小吉'];
    const count = [month, day, hour].filter((n) => ji.includes(n)).length;
    if (count === 3) return '大吉';
    if (count === 2) return '中吉';
    if (count === 1) return '小吉';
    return '凶';
  }
}
