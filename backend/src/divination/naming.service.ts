import { Injectable } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar } = require('lunar-javascript');

/** 天干五行 */
const TIANGAN_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

/** 地支五行 */
const DIZHI_WUXING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

/** 五行相生 */
const WUXING_SHENG: Record<string, string> = {
  '金': '水', '水': '木', '木': '火', '火': '土', '土': '金',
};

/** 五行相克 */
const WUXING_KE: Record<string, string> = {
  '金': '木', '木': '土', '土': '水', '水': '火', '火': '金',
};

/** 天格、人格、地格对应三才五行（按笔画尾数） */
const BIHUA_WUXING = (n: number): string => {
  const tail = n % 10;
  if (tail === 1 || tail === 2) return '木';
  if (tail === 3 || tail === 4) return '火';
  if (tail === 5 || tail === 6) return '土';
  if (tail === 7 || tail === 8) return '金';
  return '水'; // 9, 0
};

/** 五格吉凶数理（简化版，81数理） */
const JIXIONG_81: Record<number, { ji: boolean; desc: string }> = {
  1: { ji: true, desc: '万物开泰·吉' },
  2: { ji: false, desc: '一身孤节·凶' },
  3: { ji: true, desc: '进取如意·吉' },
  4: { ji: false, desc: '万事休止·凶' },
  5: { ji: true, desc: '福禄长寿·吉' },
  6: { ji: true, desc: '安稳余庆·吉' },
  7: { ji: true, desc: '刚毅果断·吉' },
  8: { ji: true, desc: '意志坚固·吉' },
  9: { ji: false, desc: '兴尽凶始·凶' },
  10: { ji: false, desc: '万事终局·凶' },
  11: { ji: true, desc: '稳健吉顺·吉' },
  12: { ji: false, desc: '薄弱无力·凶' },
  13: { ji: true, desc: '智略超群·吉' },
  14: { ji: false, desc: '沦落天涯·凶' },
  15: { ji: true, desc: '福寿双全·吉' },
  16: { ji: true, desc: '贵人得助·吉' },
  17: { ji: true, desc: '刚柔兼备·吉' },
  18: { ji: true, desc: '有志竟成·吉' },
  19: { ji: false, desc: '多难遮云·凶' },
  20: { ji: false, desc: '非业破运·凶' },
  21: { ji: true, desc: '独立权威·吉' },
  22: { ji: false, desc: '秋草逢霜·凶' },
  23: { ji: true, desc: '旭日东升·吉' },
  24: { ji: true, desc: '绵绣前程·吉' },
  25: { ji: true, desc: '资性英敏·吉' },
  26: { ji: false, desc: '变怪奇异·凶' },
  27: { ji: false, desc: '欲望难足·凶' },
  28: { ji: false, desc: '家亲缘薄·凶' },
  29: { ji: true, desc: '智谋优秀·吉' },
  30: { ji: false, desc: '浮沉不定·凶' },
  31: { ji: true, desc: '智勇得志·吉' },
  32: { ji: true, desc: '宝马金鞍·吉' },
  33: { ji: true, desc: '家门隆昌·吉' },
  35: { ji: true, desc: '温和平静·吉' },
  36: { ji: false, desc: '波澜壮阔·凶' },
  37: { ji: true, desc: '权威显达·吉' },
  38: { ji: false, desc: '磨铁成针·凶' },
  39: { ji: true, desc: '富贵荣华·吉' },
  40: { ji: false, desc: '退安享福·凶' },
  41: { ji: true, desc: '德望高大·吉' },
  45: { ji: true, desc: '顺风扬帆·吉' },
  47: { ji: true, desc: '点石成金·吉' },
  48: { ji: true, desc: '古松立鹤·吉' },
  52: { ji: true, desc: '眼望高山·吉' },
  57: { ji: true, desc: '寒雪青松·吉' },
  61: { ji: true, desc: '牡丹芙蓉·吉' },
  63: { ji: true, desc: '舟归平海·吉' },
  65: { ji: true, desc: '富贵至极·吉' },
  67: { ji: true, desc: '利路亨通·吉' },
  68: { ji: true, desc: '兴家立业·吉' },
  81: { ji: true, desc: '万物回春·吉' },
};

/** 查81数理吉凶 */
function getShuli(n: number): { ji: boolean; desc: string } {
  const mod = n > 81 ? ((n - 1) % 80) + 1 : n;
  return JIXIONG_81[mod] || { ji: mod % 2 === 1, desc: mod % 2 === 1 ? '吉' : '凶' };
}

/** 常用汉字康熙笔画（简化映射，覆盖常见姓氏和名字用字） */
const KANGXI_STROKES: Record<string, number> = {
  '一': 1, '丁': 2, '七': 2, '万': 15, '丈': 3, '三': 3, '上': 3, '下': 3,
  '于': 3, '久': 3, '也': 3, '之': 4, '云': 12, '井': 4, '亮': 9, '人': 2,
  '仁': 4, '今': 4, '仙': 5, '令': 5, '以': 5, '伟': 11, '伯': 7, '佳': 8,
  '俊': 9, '信': 9, '健': 11, '元': 4, '光': 6, '克': 7, '兰': 23, '军': 9,
  '冰': 6, '凤': 14, '刚': 10, '利': 7, '力': 2, '功': 5, '勇': 9, '华': 14,
  '博': 12, '卫': 15, '友': 4, '双': 18, '发': 12, '叶': 15, '吉': 6, '君': 7,
  '启': 11, '和': 8, '哲': 10, '嘉': 14, '国': 11, '坤': 8, '城': 10, '培': 11,
  '天': 4, '太': 4, '奇': 8, '妍': 7, '妙': 7, '姿': 9, '婉': 11, '婷': 12,
  '子': 3, '孝': 7, '学': 16, '宁': 14, '安': 6, '宏': 7, '宜': 8, '宝': 20,
  '家': 10, '富': 12, '寒': 12, '小': 3, '少': 4, '尚': 8, '山': 3, '岩': 8,
  '峰': 10, '川': 3, '平': 5, '广': 15, '庆': 15, '康': 11, '建': 9, '强': 11,
  '彤': 7, '彦': 9, '心': 4, '志': 7, '思': 9, '怡': 9, '恒': 10, '悦': 11,
  '慧': 15, '成': 7, '才': 4, '振': 11, '文': 4, '新': 13, '方': 4, '旭': 6,
  '昊': 8, '明': 8, '星': 9, '春': 9, '晓': 16, '晨': 11, '景': 12, '智': 12,
  '月': 4, '朋': 8, '朝': 12, '木': 4, '本': 5, '杰': 12, '松': 8, '林': 8,
  '柏': 9, '树': 16, '梅': 11, '梦': 14, '楠': 13, '欢': 22, '正': 5, '武': 8,
  '毅': 15, '民': 5, '水': 4, '永': 5, '江': 7, '沐': 8, '河': 9, '泉': 9,
  '泽': 17, '洁': 10, '浩': 11, '海': 11, '涛': 18, '淑': 12, '清': 12, '源': 14,
  '火': 4, '灵': 24, '炎': 8, '烨': 16, '然': 12, '煜': 13, '熙': 13, '燕': 16,
  '玉': 5, '玲': 10, '珊': 10, '珍': 10, '琪': 13, '琳': 13, '瑞': 14, '瑶': 15,
  '生': 5, '田': 5, '白': 5, '皓': 12, '盛': 12, '睿': 14, '石': 5, '磊': 15,
  '祥': 11, '福': 14, '秀': 7, '程': 12, '立': 5, '竹': 6, '笑': 10, '紫': 11,
  '红': 9, '纯': 10, '绍': 11, '维': 14, '美': 9, '翔': 12, '翠': 14, '耀': 20,
  '胜': 12, '腾': 20, '自': 6, '芳': 10, '芸': 10, '若': 11, '英': 11, '茂': 11,
  '荣': 14, '莉': 13, '菲': 14, '萍': 14, '蓉': 16, '蕾': 19, '薇': 19, '虎': 8,
  '诚': 14, '豪': 14, '贤': 15, '超': 12, '辉': 15, '达': 16, '远': 17, '金': 8,
  '鑫': 24, '铭': 14, '锋': 15, '长': 8, '阳': 17, '雅': 12, '雨': 8, '雪': 11,
  '霞': 17, '青': 8, '静': 16, '韵': 19, '飞': 9, '馨': 20, '鸿': 17, '鹏': 19,
  '龙': 16, '丽': 19, '亚': 8, '伦': 10, '佩': 8, '凯': 12, '刘': 15, '勤': 13,
  '卓': 8, '南': 9, '善': 12, '圆': 13, '坚': 11, '大': 3, '奕': 9, '威': 9,
  '娜': 10, '娟': 10, '媛': 12, '宇': 6, '守': 6, '宗': 8, '定': 8, '宣': 9,
  '容': 10, '寿': 14, '岚': 12, '巍': 21, '帅': 9, '希': 7, '庭': 10, '延': 7,
  '张': 11, '彬': 11, '德': 15, '忠': 8, '恩': 10, '惠': 12, '意': 13, '慈': 14,
  '戈': 4, '承': 8, '政': 8, '敏': 11, '斌': 11, '日': 4, '旺': 8, '昌': 8,
  '昕': 8, '晖': 13, '晗': 11, '曦': 20, '朗': 11, '权': 22, '李': 7, '柔': 9,
  '栋': 12, '桂': 10, '桃': 10, '梓': 11, '森': 12, '楷': 13, '榕': 14, '欣': 8,
  '歌': 14, '殿': 13, '汉': 15, '汝': 7, '池': 7, '沛': 8, '波': 9, '洋': 10,
  '洪': 10, '浪': 11, '润': 16, '淼': 12, '渊': 12, '湘': 13, '溪': 14, '滨': 18,
  '潇': 20, '澄': 16, '瀚': 20, '玮': 14, '珂': 10, '珠': 11, '琦': 13, '琴': 13,
  '瑜': 14, '璇': 16, '璐': 18, '甜': 11, '畅': 14, '百': 6, '益': 10, '相': 9,
  '真': 10, '硕': 14, '祺': 13, '禹': 9, '秋': 9, '稳': 19, '穆': 16, '章': 11,
  '端': 14, '策': 12, '筠': 13, '素': 10, '经': 13, '绮': 14, '群': 13, '羽': 6,
  '翰': 16, '聪': 17, '育': 10, '舒': 12, '艳': 24, '芝': 10, '花': 8, '苗': 11,
  '茜': 12, '莲': 17, '萌': 14, '蒙': 16, '蓝': 20, '蕊': 18, '行': 6, '衡': 16,
  '裕': 13, '西': 6, '言': 7, '诗': 13, '语': 14, '谦': 17, '谨': 18, '贵': 12,
  '赫': 14, '轩': 10, '辰': 7, '运': 11, '进': 15, '逸': 15, '道': 16, '邦': 11,
  '郁': 13, '鉴': 22, '钰': 13, '银': 14, '锐': 15, '锦': 16, '镇': 18, '雄': 12,
  '霖': 16, '露': 20, '颖': 16, '风': 9, '飘': 20, '香': 9, '骏': 17, '高': 10,
  '魏': 18, '鸣': 14, '黎': 15,
  '王': 4, '赵': 14, '钱': 16, '孙': 10, '周': 8, '吴': 7, '郑': 19, '冯': 12,
  '陈': 16, '褚': 15, '蒋': 17, '沈': 8, '韩': 17, '杨': 13, '朱': 6,
  '秦': 10, '许': 11, '何': 7, '吕': 7, '施': 9, '余': 7, '袁': 10, '邓': 19,
  '苏': 22, '潘': 16, '葛': 15, '范': 15, '彭': 12, '鲁': 15, '马': 10,
  '任': 6, '唐': 10, '罗': 20, '薛': 19, '贺': 12,
  '倪': 10, '汤': 13, '殷': 10, '黄': 12, '萧': 18, '尹': 4, '姚': 9, '邵': 12,
  '湛': 13, '汪': 8, '祁': 8, '毛': 4, '狄': 8, '米': 6, '贝': 7,
  '臧': 14, '计': 9, '伏': 6, '戴': 18, '谈': 15, '宋': 7,
  '茅': 11, '庞': 19, '纪': 9, '屈': 8, '项': 12, '祝': 10, '董': 15,
  '梁': 11, '杜': 7, '阮': 12, '闵': 12, '席': 10, '季': 8, '麻': 11,
  '贾': 13, '路': 13, '娄': 11, '危': 6, '童': 12, '颜': 18, '郭': 15,
  '邱': 12, '骆': 16, '夏': 10, '蔡': 17, '樊': 15, '胡': 11, '凌': 10,
  '霍': 16, '虞': 13, '曹': 11, '段': 9, '雷': 13, '龚': 22,
  '嵇': 13, '邢': 11, '滑': 14, '裴': 14, '陆': 16, '翁': 10,
  '荀': 12, '羊': 6, '甄': 14, '曲': 6, '封': 9, '左': 5, '崔': 11,
  '钮': 12, '谢': 17, '邹': 17, '窦': 20,
  '柳': 9, '申': 5, '欧': 15, '耿': 10, '聂': 18, '关': 19, '丰': 18,
  '薄': 19, '从': 11, '崇': 11, '裘': 13, '缪': 17, '干': 3, '解': 13, '应': 17,
  '贲': 12, '邰': 13, '乐': 15, '雍': 13,
  '单': 12, '杭': 8, '包': 5, '诸': 16, '焦': 12,
  '巴': 4, '弓': 3, '牧': 8, '隗': 12, '谷': 7, '车': 7,
  '全': 6, '郗': 14, '班': 10, '仰': 6, '仲': 6, '伊': 6, '宫': 10,
  '仇': 4, '栾': 23, '暴': 15, '钭': 12, '厉': 15, '戎': 6,
  '祖': 10, '符': 11, '詹': 13, '束': 7,
  '幸': 8, '司': 5, '韶': 14, '郜': 14, '蓟': 21, '溥': 14,
  '印': 6, '宿': 11, '怀': 20, '蒲': 16, '鄂': 18, '索': 10,
  '咸': 9, '籍': 20, '赖': 16, '蔺': 22, '屠': 11,
  '乔': 12, '阴': 12, '胥': 9, '能': 10, '苍': 16, '闻': 14, '莘': 13, '党': 20,
  '翟': 14, '谭': 19, '贡': 10, '劳': 12, '逄': 14, '姬': 10, '连': 14, '岳': 17,
};

/** 获取汉字康熙笔画（查表或默认估算） */
function getKangxiStroke(char: string): number {
  if (KANGXI_STROKES[char] !== undefined) return KANGXI_STROKES[char];
  // 未收录的字，用 Unicode 粗略估算（不精确，但作为兜底）
  const code = char.charCodeAt(0);
  if (code >= 0x4e00 && code <= 0x9fff) {
    return ((code - 0x4e00) % 20) + 4;
  }
  return 10;
}

export interface WugeResult {
  tiange: { value: number; wuxing: string; shuli: string; ji: boolean };
  renge: { value: number; wuxing: string; shuli: string; ji: boolean };
  dige: { value: number; wuxing: string; shuli: string; ji: boolean };
  waige: { value: number; wuxing: string; shuli: string; ji: boolean };
  zongge: { value: number; wuxing: string; shuli: string; ji: boolean };
  sancai: string; // 三才配置，如 "木火土"
}

export interface BaziInfo {
  siZhu: string;        // 四柱，如 "甲子 丙寅 戊辰 庚午"
  riGan: string;        // 日干
  riGanWuxing: string;  // 日干五行
  wuxingCount: Record<string, number>;
  wuxingLack: string[];
  xiyong: string;       // 喜用神五行
  jishen: string;       // 忌神五行
}

export interface NamingResult {
  // 输入信息
  surname: string;
  gender: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  // 八字信息
  bazi: BaziInfo;
  // 五格分析（如果提供了名字）
  wuge?: WugeResult;
  nameChars?: { char: string; stroke: number }[];
  nameScore?: number;
  // 取名建议
  recommendWuxing: string[];   // 推荐五行
  recommendStrokes: number[][]; // 推荐笔画组合
}

@Injectable()
export class NamingService {
  /**
   * 起名改名分析
   */
  calculate(
    surname: string,
    gender: string,
    birthYear: number,
    birthMonth: number,
    birthDay: number,
    birthHour: number,
    name?: string,
  ): NamingResult {
    // 1. 排八字
    const bazi = this.getBazi(birthYear, birthMonth, birthDay, birthHour);

    // 2. 推荐五行（喜用神对应的五行）
    const recommendWuxing = this.getRecommendWuxing(bazi);

    // 3. 推荐笔画组合
    const surnameStrokes = this.getSurnameStrokes(surname);
    const recommendStrokes = this.getRecommendStrokes(surnameStrokes);

    const result: NamingResult = {
      surname,
      gender,
      birthYear, birthMonth, birthDay, birthHour,
      bazi,
      recommendWuxing,
      recommendStrokes,
    };

    // 4. 如果提供了名字，进行五格分析和评分
    if (name && name.length > 0) {
      const nameChars = [...name].map(c => ({ char: c, stroke: getKangxiStroke(c) }));
      const wuge = this.calcWuge(surnameStrokes, nameChars.map(c => c.stroke));
      const nameScore = this.calcScore(wuge, bazi, recommendWuxing);
      result.wuge = wuge;
      result.nameChars = nameChars;
      result.nameScore = nameScore;
    }

    return result;
  }

  /** 排八字简化版 */
  private getBazi(year: number, month: number, day: number, hour: number): BaziInfo {
    // hour 为时辰序号 0-11（子丑寅卯辰巳午未申酉戌亥），转为实际小时
    const hourValue = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22][hour] ?? 12;
    const solar = Solar.fromYmdHms(year, month, day, hourValue, 0, 0);
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();

    const yearGZ = eightChar.getYear();
    const monthGZ = eightChar.getMonth();
    const dayGZ = eightChar.getDay();
    // 根据时辰获取时柱
    const timeGZ = eightChar.getTime();

    const siZhu = `${yearGZ} ${monthGZ} ${dayGZ} ${timeGZ}`;
    const riGan = dayGZ.charAt(0);
    const riGanWuxing = TIANGAN_WUXING[riGan] || '土';

    // 统计五行
    const wuxingCount: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
    const allChars = `${yearGZ}${monthGZ}${dayGZ}${timeGZ}`;
    for (const c of allChars) {
      if (TIANGAN_WUXING[c]) wuxingCount[TIANGAN_WUXING[c]]++;
      if (DIZHI_WUXING[c]) wuxingCount[DIZHI_WUXING[c]]++;
    }

    const wuxingLack = Object.entries(wuxingCount).filter(([, v]) => v === 0).map(([k]) => k);

    // 简化喜用神判断：缺什么补什么 + 日干强弱
    const total = Object.values(wuxingCount).reduce((a, b) => a + b, 0);
    const riCount = wuxingCount[riGanWuxing] || 0;
    const isStrong = riCount >= total / 5 * 1.5;

    let xiyong: string;
    let jishen: string;
    if (isStrong) {
      // 身强：喜克泄耗（克我、我生、我克）
      xiyong = WUXING_KE[riGanWuxing] ? this.getKeWuxing(riGanWuxing) : '金';
      jishen = riGanWuxing;
    } else {
      // 身弱：喜生扶（生我、同我）
      xiyong = this.getShengWuxing(riGanWuxing);
      jishen = WUXING_KE[riGanWuxing] || '火';
    }

    return { siZhu, riGan, riGanWuxing, wuxingCount, wuxingLack, xiyong, jishen };
  }

  /** 获取克我的五行 */
  private getKeWuxing(wx: string): string {
    for (const [k, v] of Object.entries(WUXING_KE)) {
      if (v === wx) return k;
    }
    return '金';
  }

  /** 获取生我的五行 */
  private getShengWuxing(wx: string): string {
    for (const [k, v] of Object.entries(WUXING_SHENG)) {
      if (v === wx) return k;
    }
    return '土';
  }

  /** 推荐五行 */
  private getRecommendWuxing(bazi: BaziInfo): string[] {
    const result: string[] = [bazi.xiyong];
    // 缺失的五行也推荐
    for (const wx of bazi.wuxingLack) {
      if (!result.includes(wx)) result.push(wx);
    }
    // 生喜用神的五行
    const shengXiyong = this.getShengWuxing(bazi.xiyong);
    if (!result.includes(shengXiyong)) result.push(shengXiyong);
    return result.slice(0, 3);
  }

  /** 获取姓氏总笔画 */
  private getSurnameStrokes(surname: string): number {
    let total = 0;
    for (const c of surname) {
      total += getKangxiStroke(c);
    }
    return total;
  }

  /** 推荐笔画组合（双字名） */
  private getRecommendStrokes(surnameStrokes: number): number[][] {
    const good: number[][] = [];
    // 遍历常见笔画范围
    for (let a = 3; a <= 20; a++) {
      for (let b = 3; b <= 20; b++) {
        const tiange = surnameStrokes + 1;
        const renge = surnameStrokes + a;
        const dige = a + b;
        const zongge = surnameStrokes + a + b;
        const t = getShuli(tiange);
        const r = getShuli(renge);
        const d = getShuli(dige);
        const z = getShuli(zongge);
        // 人格、地格、总格都吉
        if (r.ji && d.ji && z.ji) {
          good.push([a, b]);
        }
      }
    }
    // 取前 10 组
    return good.slice(0, 10);
  }

  /** 计算五格 */
  private calcWuge(surnameStrokes: number, nameStrokes: number[]): WugeResult {
    const totalName = nameStrokes.reduce((a, b) => a + b, 0);
    const firstNameStroke = nameStrokes[0] || 0;
    const lastNameStroke = nameStrokes[nameStrokes.length - 1] || 0;

    const tiangeVal = surnameStrokes + 1;
    const rengeVal = surnameStrokes + firstNameStroke;
    const digeVal = nameStrokes.length === 1 ? firstNameStroke + 1 : firstNameStroke + lastNameStroke;
    const zonggeVal = surnameStrokes + totalName;
    const waigeVal = nameStrokes.length === 1
      ? 2
      : zonggeVal - rengeVal + 1;

    const tiangeShuli = getShuli(tiangeVal);
    const rengeShuli = getShuli(rengeVal);
    const digeShuli = getShuli(digeVal);
    const zonggeShuli = getShuli(zonggeVal);
    const waigeShuli = getShuli(Math.max(1, waigeVal));

    const sancai = `${BIHUA_WUXING(tiangeVal)}${BIHUA_WUXING(rengeVal)}${BIHUA_WUXING(digeVal)}`;

    return {
      tiange: { value: tiangeVal, wuxing: BIHUA_WUXING(tiangeVal), shuli: tiangeShuli.desc, ji: tiangeShuli.ji },
      renge: { value: rengeVal, wuxing: BIHUA_WUXING(rengeVal), shuli: rengeShuli.desc, ji: rengeShuli.ji },
      dige: { value: digeVal, wuxing: BIHUA_WUXING(digeVal), shuli: digeShuli.desc, ji: digeShuli.ji },
      waige: { value: Math.max(1, waigeVal), wuxing: BIHUA_WUXING(Math.max(1, waigeVal)), shuli: waigeShuli.desc, ji: waigeShuli.ji },
      zongge: { value: zonggeVal, wuxing: BIHUA_WUXING(zonggeVal), shuli: zonggeShuli.desc, ji: zonggeShuli.ji },
      sancai,
    };
  }

  /** 综合评分 */
  private calcScore(wuge: WugeResult, bazi: BaziInfo, recommendWuxing: string[]): number {
    let score = 50;

    // 五格吉凶（人格最重要）
    if (wuge.renge.ji) score += 15;
    else score -= 10;
    if (wuge.dige.ji) score += 10;
    else score -= 5;
    if (wuge.zongge.ji) score += 10;
    else score -= 5;
    if (wuge.waige.ji) score += 5;
    if (wuge.tiange.ji) score += 5;

    // 三才配置中是否包含喜用五行
    const sancaiArr = [...wuge.sancai];
    for (const wx of sancaiArr) {
      if (recommendWuxing.includes(wx)) score += 5;
    }

    // 人格五行是否为喜用
    if (recommendWuxing.includes(wuge.renge.wuxing)) score += 10;
    // 地格五行是否为喜用
    if (recommendWuxing.includes(wuge.dige.wuxing)) score += 5;

    return Math.max(0, Math.min(100, score));
  }
}
