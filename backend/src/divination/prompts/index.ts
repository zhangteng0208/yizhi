// 统一导出所有提示词模板
export { BAZI_PROMPT_TEMPLATE } from './bazi.prompt.js';
export { LIUYAO_PROMPT_TEMPLATE } from './liuyao.prompt.js';
export { ZIWEI_PROMPT_TEMPLATE } from './ziwei.prompt.js';
export { MEIHUA_PROMPT_TEMPLATE } from './meihua.prompt.js';
export { QIMEN_PROMPT_TEMPLATE } from './qimen.prompt.js';
export { YIJING_PROMPT_TEMPLATE } from './yijing.prompt.js';
export { XIAOLIUREN_PROMPT_TEMPLATE } from './xiaoliuren.prompt.js';
export { ZEJI_PROMPT_TEMPLATE } from './zeji.prompt.js';
export { XUNWU_PROMPT_TEMPLATE } from './xunwu.prompt.js';
export { HEHUN_PROMPT_TEMPLATE } from './hehun.prompt.js';
export { NAMING_PROMPT_TEMPLATE } from './naming.prompt.js';

// 提示词模板接口
export interface PromptTemplate {
  system: (depth: 'simple' | 'normal' | 'pro') => string;
  user: (data: any, question?: string) => string;
}

// 提示词版本
export const PROMPT_VERSION = '2.0.0';
