import { Injectable, Logger } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { HEXAGRAM } = require('cantian-liuyao');

export interface YijingYao {
  position: string;   // 初九、六二...
  value: number;       // 6老阴 7少阳 8少阴 9老阳
  text: string;        // 爻辞
  isMoving: boolean;
}

export interface YijingGua {
  name: string;
  gua: string;
  symbol: string;
  sequence: number;
  judgement: string;   // 卦辞
  text: string;        // 大象
  upper: { name: string; nick: string; symbol: string };
  lower: { name: string; nick: string; symbol: string };
}

export interface YijingResult {
  origin: YijingGua;
  changed: YijingGua | null;
  yaos: YijingYao[];
  movingCount: number;
  /** 断卦规则说明 */
  rule: string;
  /** 应重点参看的爻辞/卦辞 */
  focus: string[];
}

@Injectable()
export class YijingService {
  private readonly logger = new Logger(YijingService.name);

  /**
   * 大衍筮法起卦
   * 49策，分二挂一揲四归奇，三变成一爻，十八变成卦
   */
  calculate(): YijingResult {
    const values: number[] = [];
    for (let i = 0; i < 6; i++) {
      values.push(this.shiCaoYao());
    }
    return this.buildResult(values);
  }

  /** 一爻：三变得数 */
  private shiCaoYao(): number {
    let total = 49;
    const remainders: number[] = [];

    for (let bian = 0; bian < 3; bian++) {
      // 分二：随机分成两堆
      const left = Math.floor(Math.random() * (total - 2)) + 1;
      const right = total - left;
      // 挂一：从右堆取一
      const guaYi = 1;
      const rightAfter = right - guaYi;
      // 揲四：左堆除以4取余
      const leftRem = left % 4 || 4;
      // 揲四：右堆除以4取余
      const rightRem = rightAfter % 4 || 4;
      // 归奇
      const remainder = leftRem + rightRem + guaYi;
      remainders.push(remainder);
      total = total - remainder;
    }

    // 最终策数除以4得爻值
    const yaoNum = total / 4;
    // 6=老阴 7=少阳 8=少阴 9=老阳
    return yaoNum;
  }

  private buildResult(values: number[]): YijingResult {
    // 构建二进制卦码（0=阴 1=阳，从初爻到上爻）
    const originBits = values.map(v => (v === 7 || v === 9) ? '1' : '0').join('');
    const changedBits = values.map(v => {
      if (v === 9) return '0'; // 老阳变阴
      if (v === 6) return '1'; // 老阴变阳
      return (v === 7) ? '1' : '0';
    }).join('');

    const originGua = this.findGua(originBits);
    const movingIndexes = values.map((v, i) => (v === 6 || v === 9) ? i : -1).filter(i => i >= 0);
    const hasChanged = movingIndexes.length > 0;
    const changedGua = hasChanged ? this.findGua(changedBits) : null;

    const yaos: YijingYao[] = values.map((v, i) => ({
      position: originGua?.lineTexts?.[i]?.label || `第${i + 1}爻`,
      value: v,
      text: originGua?.lineTexts?.[i]?.text || '',
      isMoving: v === 6 || v === 9,
    }));

    const { rule, focus } = this.getReadingRule(values, yaos, originGua, changedGua, originBits);

    this.logger.log(`易经占卜 - movingCount: ${movingIndexes.length}, focus: ${JSON.stringify(focus)}`);

    return {
      origin: this.mapGua(originGua),
      changed: changedGua ? this.mapGua(changedGua) : null,
      yaos,
      movingCount: movingIndexes.length,
      rule,
      focus,
    };
  }

  private findGua(bits: string): any {
    const lowerBits = bits.substring(0, 3);
    const upperBits = bits.substring(3, 6);
    const key = upperBits + lowerBits; // HEXAGRAM key: upper+lower
    // 尝试两种顺序
    return HEXAGRAM[key] || HEXAGRAM[lowerBits + upperBits] || this.searchGua(bits);
  }

  private searchGua(bits: string): any {
    for (const [k, v] of Object.entries(HEXAGRAM)) {
      if (k === bits) return v;
    }
    return null;
  }

  private mapGua(g: any): YijingGua {
    if (!g) return { name: '未知', gua: '', symbol: '', sequence: 0, judgement: '', text: '', upper: { name: '', nick: '', symbol: '' }, lower: { name: '', nick: '', symbol: '' } };
    return {
      name: g.name || '',
      gua: g.gua || '',
      symbol: g.symbol || '',
      sequence: g.sequence || 0,
      judgement: g.judgement || '',
      text: g.text || '',
      upper: g.upper || { name: '', nick: '', symbol: '' },
      lower: g.lower || { name: '', nick: '', symbol: '' },
    };
  }

  /**
   * 朱熹《筮仪》断卦规则
   */
  private getReadingRule(values: number[], yaos: YijingYao[], origin: any, changed: any, originBits: string): { rule: string; focus: string[] } {
    const movingCount = values.filter(v => v === 6 || v === 9).length;
    const movingIndexes = values.map((v, i) => (v === 6 || v === 9) ? i : -1).filter(i => i >= 0);
    const focus: string[] = [];

    if (movingCount === 0) {
      focus.push(`本卦卦辞：${origin?.judgement || ''}`);
      return { rule: '六爻皆不变，以本卦卦辞断之', focus };
    }
    if (movingCount === 1) {
      const idx = movingIndexes[0];
      focus.push(`本卦${yaos[idx].position}：${yaos[idx].text}`);
      return { rule: '一爻变，以本卦变爻爻辞断之', focus };
    }
    if (movingCount === 2) {
      movingIndexes.forEach(idx => focus.push(`本卦${yaos[idx].position}：${yaos[idx].text}`));
      return { rule: '二爻变，以本卦二变爻爻辞断之，以上爻为主', focus };
    }
    if (movingCount === 3) {
      focus.push(`本卦卦辞：${origin?.judgement || ''}`);
      focus.push(`变卦卦辞：${changed?.judgement || ''}`);
      return { rule: '三爻变，以本卦卦辞为贞、变卦卦辞为悔', focus };
    }
    if (movingCount === 4) {
      const stillIndexes = values.map((v, i) => (v === 7 || v === 8) ? i : -1).filter(i => i >= 0);
      stillIndexes.forEach(idx => {
        const changedYaoText = changed?.lineTexts?.[idx]?.text || '';
        const changedYaoLabel = changed?.lineTexts?.[idx]?.label || `第${idx + 1}爻`;
        focus.push(`变卦${changedYaoLabel}：${changedYaoText}`);
      });
      return { rule: '四爻变，以变卦二不变爻爻辞断之，以下爻为主', focus };
    }
    if (movingCount === 5) {
      const stillIdx = values.findIndex(v => v === 7 || v === 8);
      if (stillIdx >= 0) {
        const changedYaoText = changed?.lineTexts?.[stillIdx]?.text || '';
        const changedYaoLabel = changed?.lineTexts?.[stillIdx]?.label || `第${stillIdx + 1}爻`;
        focus.push(`变卦${changedYaoLabel}：${changedYaoText}`);
      }
      return { rule: '五爻变，以变卦不变爻爻辞断之', focus };
    }
    // 6爻全变
    if (originBits === '111111') {
      focus.push('用九：见群龙无首，吉。');
    } else if (originBits === '000000') {
      focus.push('用六：利永贞。');
    } else {
      focus.push(`变卦卦辞：${changed?.judgement || ''}`);
    }
    return { rule: '六爻皆变，乾用"用九"、坤用"用六"，余卦以变卦卦辞断之', focus };
  }
}
