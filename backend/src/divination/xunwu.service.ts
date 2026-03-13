import { Injectable } from '@nestjs/common';

/** 六神定义 */
const LIU_SHEN = [
  {
    name: '大安',
    wuxing: '木',
    direction: '东方',
    location: '家中或附近，未走远',
    desc: '身不动时，五行属木，颜色青色，方位东方。临青龙，谋事主一、五、七。有静止、心安、吉祥之含义。',
    xunwu: '失物去不远，宅舍保安康。物在东方或家中，静止未动，容易找到。',
    xunren: '行人身未动，在家或附近，平安无事，不日即归。',
  },
  {
    name: '留连',
    wuxing: '水',
    direction: '北方',
    location: '北方水边，或被人留住',
    desc: '人未归时，五行属水，颜色黑色，方位北方。临玄武，谋事主二、八、十。有暗昧不明、延迟、纠缠、拖延之含义。',
    xunwu: '失物南方见，急讨方心称。物在北方或水边，被人留住或遗失难寻。',
    xunren: '去者未回程，人在外地被事缠住，短期难归，需耐心等待。',
  },
  {
    name: '速喜',
    wuxing: '火',
    direction: '南方',
    location: '南方或光亮处',
    desc: '人即至时，五行属火，颜色红色，方位南方。临朱雀，谋事主三、六、九。有快速、喜庆、吉利之含义。',
    xunwu: '失物申未午，逢人路上寻。物在南方，很快能找到，或有人送还。',
    xunren: '行人有信音，人在南方，即将归来，有好消息传来。',
  },
  {
    name: '赤口',
    wuxing: '金',
    direction: '西方',
    location: '西方或金属处',
    desc: '官事凶时，五行属金，颜色白色，方位西方。临白虎，谋事主四、七、十。有不吉、惊恐、凶险、口舌是非之含义。',
    xunwu: '失物速速讨，否则难寻回。物在西方，需尽快寻找，否则恐被损坏或丢失。',
    xunren: '行人有惊慌，人在西方，路途不顺，有惊险，需注意安全。',
  },
  {
    name: '小吉',
    wuxing: '水',
    direction: '西南',
    location: '西南或坤方',
    desc: '人来喜时，五行属水，颜色黑色，方位西南。临六合，谋事主一、五、七。有和合、吉利之含义。',
    xunwu: '失物在坤方，阴人来报喜。物在西南方，有女性或阴人知晓，可询问。',
    xunren: '行人即便至，人在西南，不日即归，有喜事相随。',
  },
  {
    name: '空亡',
    wuxing: '土',
    direction: '中央',
    location: '中央或土中',
    desc: '音信稀时，五行属土，颜色黄色，方位中央。临勾陈，谋事主三、六、九。有不吉、无结果、忧虑之含义。',
    xunwu: '失物寻不见，恐已损坏或遗失。物在中央或土中，难以寻回。',
    xunren: '行人有灾殃，音信全无，恐有不测，需多方打听。',
  },
];

export interface XunwuResult {
  type: 'xunwu' | 'xunren'; // 寻物或寻人
  question: string;
  itemName?: string; // 物品名称
  personName?: string; // 人名
  lostTime?: string; // 丢失时间
  lostPlace?: string; // 丢失地点
  monthShen: { name: string; wuxing: string; direction: string; location: string; desc: string; xunwu: string; xunren: string; index: number };
  dayShen: { name: string; wuxing: string; direction: string; location: string; desc: string; xunwu: string; xunren: string; index: number };
  hourShen: { name: string; wuxing: string; direction: string; location: string; desc: string; xunwu: string; xunren: string; index: number };
  jixiong: string;
  direction: string; // 综合方位
  canFind: boolean; // 能否找到
  timeframe: string; // 时间预测
}

@Injectable()
export class XunwuService {
  /**
   * 寻人寻物起卦
   */
  calculate(
    type: 'xunwu' | 'xunren',
    question: string,
    numbers: number[], // 三个数字
    itemName?: string,
    personName?: string,
    lostTime?: string,
    lostPlace?: string,
  ): XunwuResult {
    // 使用三个数字起卦
    const monthIndex = ((numbers[0] - 1) % 6 + 6) % 6;
    const dayIndex = ((numbers[1] - 1) % 6 + 6) % 6;
    const hourIndex = ((numbers[2] - 1) % 6 + 6) % 6;

    const monthShen = LIU_SHEN[monthIndex];
    const dayShen = LIU_SHEN[dayIndex];
    const hourShen = LIU_SHEN[hourIndex];

    const jixiong = this.judgeJixiong(monthShen.name, dayShen.name, hourShen.name);
    const direction = this.judgeDirection(monthShen, dayShen, hourShen);
    const canFind = this.judgeCanFind(monthShen.name, dayShen.name, hourShen.name);
    const timeframe = this.judgeTimeframe(monthShen.name, dayShen.name, hourShen.name);

    return {
      type,
      question,
      itemName,
      personName,
      lostTime,
      lostPlace,
      monthShen: { ...monthShen, index: monthIndex },
      dayShen: { ...dayShen, index: dayIndex },
      hourShen: { ...hourShen, index: hourIndex },
      jixiong,
      direction,
      canFind,
      timeframe,
    };
  }

  private judgeJixiong(month: string, day: string, hour: string): string {
    const ji = ['大安', '速喜', '小吉'];
    const count = [month, day, hour].filter(n => ji.includes(n)).length;
    if (count === 3) return '大吉';
    if (count === 2) return '中吉';
    if (count === 1) return '小吉';
    return '凶';
  }

  private judgeDirection(month: any, day: any, hour: any): string {
    // 以终宫（时辰宫）为主要方位
    const mainDir = hour.direction;

    // 如果三宫方位一致，则更加确定
    if (month.direction === day.direction && day.direction === hour.direction) {
      return `${mainDir}（方位明确）`;
    }

    // 否则以终宫为主，兼看其他
    const dirs = [month.direction, day.direction, hour.direction];
    const uniqueDirs = [...new Set(dirs)];

    if (uniqueDirs.length === 1) {
      return mainDir;
    } else if (uniqueDirs.length === 2) {
      return `${mainDir}，兼看${uniqueDirs.find(d => d !== mainDir)}`;
    } else {
      return `${mainDir}为主，方位不定`;
    }
  }

  private judgeCanFind(month: string, day: string, hour: string): boolean {
    // 空亡、赤口不利寻找
    const bad = ['空亡', '赤口'];
    const badCount = [month, day, hour].filter(n => bad.includes(n)).length;

    // 大安、速喜、小吉有利寻找
    const good = ['大安', '速喜', '小吉'];
    const goodCount = [month, day, hour].filter(n => good.includes(n)).length;

    return goodCount > badCount;
  }

  private judgeTimeframe(month: string, day: string, hour: string): string {
    // 速喜：很快
    if (hour === '速喜') return '一至三日内';

    // 大安：不远
    if (hour === '大安') return '三至七日内';

    // 小吉：较快
    if (hour === '小吉') return '五至十日内';

    // 留连：延迟
    if (hour === '留连') return '十日以上，需耐心';

    // 赤口：紧急
    if (hour === '赤口') return '需立即寻找，否则难寻';

    // 空亡：难寻
    if (hour === '空亡') return '难以确定，恐已遗失';

    return '时间不定';
  }
}
