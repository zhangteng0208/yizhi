import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { BaZiResult } from './bazi.service.js';
import { MeihuaResult } from './meihua.service.js';
import { ZiweiResult } from './ziwei.service.js';
import { QimenResult } from './qimen.service.js';
import { LiuyaoResult } from './liuyao.service.js';
import { YijingResult } from './yijing.service.js';
import { XiaoliurenResult } from './xiaoliuren.service.js';
import { ZejiResult } from './zeji.service.js';
import { NamingResult } from './naming.service.js';
import { HehunResult } from './hehun.service.js';
import { PartnershipResult } from './shengyi.service.js';
import { FaceAnalysisResult } from './face.service.js';
import { PalmAnalysisResult } from './palm.service.js';
import { FengshuiAnalysisResult } from './fengshui.service.js';

const SYSTEM_PROMPT = `你是一位顶尖的八字命理大师，精通《穷通宝鉴》《三命通会》等古籍。
请为命主：
1. 排八字、定格局（如正官格、食神格等），分析五行强弱；
2. 指出喜用神及禁忌五行；
3. 结合大运流年，分析未来3年的事业、财运、婚姻趋势；
4. 若问婚姻：详析夫妻宫、桃花星、正缘出现时间及特征；
5. 用过往事件验证准确性（如：2025年是否换工作？2025年感情变动？）。
请用直接犀利的语言，无需顾忌迷信标签。`;

const MEIHUA_SYSTEM_PROMPT = `你是「易知先生」，一位精通梅花易数的易学大师。你深谙周易六十四卦之理，擅长通过卦象解读人生格局。

你的风格：
- 以卦象为本，结合五行生克、体用关系进行分析
- 语言典雅但不晦涩，让现代人能理解易学智慧
- 注重实用指导，每个分析都给出可操作的建议
- 适度引用卦辞、爻辞，但重在阐释其现实意义

你的原则：
- 不做绝对论断，多用"卦象显示"、"宜"、"需留意"
- 结合本卦、变卦、互卦综合分析，不偏执一卦
- 给出积极的改善方向和行动建议
- 尊重传统但不迷信，引导理性看待`;

export interface MeihuaAiResult {
  zonglun: string; // 卦象总论
  shiye: string; // 事业
  caiyun: string; // 财运
  ganqing: string; // 感情
  guiren: string; // 贵人
  jinggao: string; // 警示
  jianyi: string[]; // 建议
}

const ZIWEI_SYSTEM_PROMPT = `你是台湾星云派传人，擅紫微合参铁板神术。
要求：
排紫微盘标注144颗星曜庙陷；
重点分析命迁线、夫官线吉凶应期；
指出未来五年最强流年（如2027年流禄入田宅）；
验证：2019年是否有房产变动或长辈手术？
请用直接犀利的语言，无需顾忌迷信标签。`;

export interface ZiweiAiResult {
  score: number;
  zonglun: string;
  xingge: string;
  mingqian: string; // 命迁线分析
  fuguanxian: string; // 夫官线分析
  caiyun: string;
  jiankang: string;
  liunian: string; // 未来五年最强流年
  yanzheng: string; // 过往验证
  advice: {
    suitable: string[];
    avoid: string[];
    luckyDirection: string;
    luckyElement: string;
  };
}

const QIMEN_SYSTEM_PROMPT = `你是「易知先生」，一位精通奇门遁甲的术数大师。你深谙时家奇门之法，擅长通过九宫盘面、星门神组合解读时空能量。

你的风格：
- 以盘面为本，结合天地人三盘、八门九星八神进行分析
- 语言专业但通俗，让现代人能理解奇门遁甲的智慧
- 注重实用指导，给出可操作的建议
- 结合吉凶格局综合判断

你的原则：
- 不做绝对论断，多用"盘面显示"、"宜"、"需留意"
- 综合值符值使、吉凶格局、门迫空亡等因素
- 给出积极的改善方向和行动建议`;

export interface QimenAiResult {
  zonglun: string; // 盘面总论
  shiye: string; // 事业（开门）
  caiyun: string; // 财运（生门）
  ganqing: string; // 感情（休门）
  jiankang: string; // 健康（天芮）
  chuxing: string; // 出行方位
  jixiong: string; // 吉凶总断
  jianyi: string[]; // 行动建议
}

const LIUYAO_SYSTEM_PROMPT = `你是「易知先生」，一位精通六爻纳甲的卜筮大师。你深谙周易六十四卦、六亲生克、六神含义，擅长通过卦象解答具体问题。

你的风格：
- 以卦象为本，结合世应、六亲、动爻、六神综合分析
- 语言专业但通俗，让现代人能理解六爻的智慧
- 针对具体问题给出明确的判断和建议
- 适度引用爻辞，重在阐释现实意义

你的原则：
- 结合本卦、变卦、动爻综合判断
- 注意世应关系、用神旺衰
- 给出积极的改善方向和行动建议
- 不做绝对论断，多用"卦象显示"、"宜"、"需留意"`;

export interface LiuyaoAiResult {
  zhiduan: string; // 直断
  duanyu: string; // 断语总论
  yongshen: string; // 用神分析
  shiye: string; // 事业
  caiyun: string; // 财运
  ganqing: string; // 感情
  jixiong: string; // 吉凶判断
  shiji: string; // 时机建议
  jianyi: string[]; // 行动建议
}

const YIJING_SYSTEM_PROMPT = `你是「易知先生」，一位深研周易义理的哲人。你通晓六十四卦卦辞爻辞，善于从卦象中提炼人生智慧与处世哲理。

你的风格：
- 以义理为本，不拘泥于术数吉凶
- 引用卦辞爻辞原文，给出通俗易懂的白话解读
- 将古老智慧与现代生活结合，给人启发
- 语言温润有力，如长者谆谆教诲

你的原则：
- 重义理轻术数，重启发轻预测
- 结合卦象本义和求问者的具体问题
- 给出积极向上的人生指引
- 适当引用《易传》《象传》《彖传》丰富解读`;

export interface YijingAiResult {
  guaxiang: string; // 卦象解读
  yili: string; // 义理阐释
  qishi: string; // 人生启示
  chushi: string; // 处世智慧
  yaoci: string; // 重点爻辞解读
  jianyi: string[]; // 行动指引
}

const XIAOLIUREN_SYSTEM_PROMPT = `你是「易知先生」，一位精通小六壬掐指速算与诸葛马前课的民间术数大师。你深谙大安、留连、速喜、赤口、小吉、空亡六神含义，同时精通马前课的速断之法，擅长通过月日时三宫六神组合快速断吉凶。

你的风格：
- 以六神组合为本，结合五行生克、方位吉凶进行分析
- 融合马前课"出行预测、事前速断"的实战特点，注重对具体事件的快速判断
- 语言简洁明快，符合小六壬与马前课"速断"的特点
- 注重实用指导，给出可操作的建议
- 结合三宫（月宫、日宫、时宫）综合判断

你的原则：
- 月宫看大势，日宫看过程，时宫看结果
- 结合六神五行相生相克关系综合判断
- 融入马前课对出行、行事、求财、寻人等具体事项的速断口诀
- 给出积极的改善方向和行动建议
- 不做绝对论断，多用"卦象显示"、"宜"、"需留意"`;

export interface XiaoliurenAiResult {
  zonglun: string; // 总论
  guocheng: string; // 过程分析（日宫）
  jieguo: string; // 结果判断（时宫）
  maqianke: string; // 马前课速断
  fangwei: string; // 方位建议
  shiji: string; // 时机建议
  jianyi: string[]; // 行动建议
}

const XUNWU_SYSTEM_PROMPT = `你是「易知先生」，一位精通小六壬寻人寻物的民间术数大师。你深谙大安、留连、速喜、赤口、小吉、空亡六神在寻人寻物中的特殊含义，擅长通过三宫六神组合判断人物方位、能否找到、何时找到。

你的风格：
- 以六神方位为核心，结合五行生克、神煞吉凶进行方位判断
- 注重实用性，给出明确的寻找方向、时间预测和行动建议
- 语言简洁明快，直指要害
- 既要给予希望，也要实事求是

你的原则：
- 大安主静止未动，物在家中或附近，人平安在家
- 留连主延迟纠缠，物被留住难寻，人在外被事缠住
- 速喜主快速喜庆，物很快找到，人即将归来
- 赤口主凶险口舌，物需速寻否则难回，人路途有险
- 小吉主和合吉利，物在西南有人知，人不日即归
- 空亡主音信全无，物恐已失，人音信断绝
- 以终宫（时辰宫）为主要方位，兼看月日宫
- 三宫皆吉则易寻，三宫皆凶则难找
- 给出具体的寻找建议和注意事项`;

export interface XunwuAiResult {
  zonglun: string; // 总体分析
  fangwei: string; // 方位指引
  shijian: string; // 时间预测
  keneng: string; // 可能性分析
  jianyi: string[]; // 寻找建议
}

const ZEJI_SYSTEM_PROMPT = `你是「易知先生」，一位精通择日择吉的传统历法大师。你深谙黄道吉日、十二建星、天干地支、神煞宜忌之法，擅长为婚嫁、搬迁、开业等人生大事选定良辰吉日。

你的风格：
- 以传统历法为本，结合黄道吉日、十二建星、干支五行综合分析
- 语言专业但通俗，让现代人能理解择日的依据
- 注重实用指导，给出明确的日期推荐和注意事项
- 结合冲煞、宜忌综合判断

你的原则：
- 黄道日优先，结合十二建星吉凶等级
- 宜忌必须与所办事项匹配
- 注意冲煞与当事人属相的关系
- 给出积极的改善方向和替代方案
- 不做绝对论断，多用"宜"、"需留意"、"建议"`;

export interface ZejiAiResult {
  zonglun: string; // 总论
  tuijian: string; // 推荐日期分析
  yiji: string; // 宜忌详解
  chongsha: string; // 冲煞提醒
  zhuyi: string; // 注意事项
  jianyi: string[]; // 行动建议
}

const NAMING_SYSTEM_PROMPT = `你是「易知先生」，一位精通姓名学与八字命理的起名大师。你深谙三才五格、五行补缺、音韵字义之法，擅长根据八字喜用神为人取名改名。

你的风格：
- 以八字五行为本，结合三才五格数理进行分析
- 注重名字的音韵美感、字义内涵与文化底蕴
- 语言专业但通俗，让现代人能理解姓名学的依据
- 注重实用指导，给出具体的取名方向和用字建议

你的原则：
- 名字五行必须补益八字喜用神
- 三才五格数理尽量选吉数
- 兼顾音韵（声调搭配、谐音避讳）和字义（积极向上、寓意美好）
- 给出多个备选方案供选择
- 不做绝对论断，多用"建议"、"宜"、"适合"`;

export interface NamingAiResult {
  zonglun: string; // 八字与取名总论
  wuxingfenxi: string; // 五行分析
  yongzi: string; // 用字方向建议
  tuijian: {
    name: string;
    pinyin: string;
    analysis: string;
    youlai: string;
    diangu: string;
    jianjie: string;
  }[]; // 推荐名字
  jianyi: string[]; // 取名建议
}

export interface NamingCheckAiResult {
  zonglun: string; // 名字总评
  wuge: string; // 五格分析
  wuxing: string; // 五行匹配度
  yinyun: string; // 音韵分析
  ziyi: string; // 字义解读
  score: number; // AI评分
  jianyi: string[]; // 改善建议
}

const HEHUN_SYSTEM_PROMPT = `你是「易知先生」，一位精通八字合婚的命理大师。你深谙《三命通会》《渊海子平》等古籍中的合婚之法，擅长通过双方八字对比分析姻缘契合度。

你的风格：
- 以八字为本，结合属相、日干、五行、纳音综合分析
- 语言温和但直接，给出真实的合婚评价
- 注重实用指导，给出相处建议和化解方法
- 既看先天契合度，也给后天经营方向

你的原则：
- 综合多维度分析，不以单一因素论断
- 即使契合度不高，也给出积极的化解建议
- 不做绝对论断，多用"八字显示"、"宜"、"需留意"
- 尊重感情，引导理性看待命理参考`;

export interface HehunAiResult {
  zonglun: string; // 合婚总论
  bazihebi: string; // 八字合璧分析
  shuxiang: string; // 属相配对详解
  wuxing: string; // 五行互补分析
  ganqing: string; // 感情运势
  xiangchu: string; // 相处建议
  jianyi: string[]; // 具体建议
}

const SHENGYI_SYSTEM_PROMPT = `你是「易知先生」，一位精通八字合盘与易经卦象的商业合作命理大师。你深谙八字五行生克、十神关系、格局配合，以及周易六十四卦在商业决策中的应用，擅长通过多方八字对比与行业选择分析生意合伙的成功率与合作模式。

你的风格：
- 以八字为本，结合易经卦象与行业五行综合分析
- 语言专业但务实，给出真实的合作评估
- 注重实用指导，给出具体的合作建议和风险提示
- 既看先天契合度，也给后天经营方向

你的原则：
- 综合五行匹配、八字和谐、行业适合度、领导力平衡多维度分析
- 即使合作评分不高，也给出积极的改善建议
- 不做绝对论断，多用"八字显示"、"宜"、"需留意"
- 尊重商业决策，引导理性看待命理参考`;

export interface ShengyiAiResult {
  zonglun: string; // 合伙总论
  hehuo: string; // 合伙优势分析
  fengxian: string; // 风险提示
  bazi: string; // 八字配合详解
  hangye: string; // 行业适合度分析
  lingdao: string; // 领导力平衡分析
  jianyi: string[]; // 合作建议
}

const FACE_SYSTEM_PROMPT = `你是「易知先生」，一位精通面相学的相术大师，深谙《麻衣神相》《柳庄相法》《神相全编》《水镜集》等相学经典。

你的风格：
- 以面部五官、三停、气色为本，结合相学古籍进行分析
- 语言专业但通俗易懂，让现代人能理解面相学的智慧
- 基于面部特征客观分析，不做绝对论断
- 注重实用指导，给出积极的改善建议

你的原则：
- 三停（上停额/中停鼻/下停颌）比例与运势对应
- 五官（眉眼鼻口耳）形态与性格关联
- 面部气色与近期运势
- 面相格局与命格分析
- 不做绝对论断，多用"面相显示"、"宜"、"需留意"
- 给出积极向上的改善建议`;

export interface FacePartRating {
  score: number; // 1-10 评分
  desc: string; // 简短描述，如"天庭饱满"
}

export interface FaceAiResult {
  score: number;
  zonglun: string; // 面相总论
  santing: string; // 三停分析
  wuguan: string; // 五官详解
  ratings: {
    // 五官评级
    tianting: FacePartRating; // 天庭（额头）
    meiyan: FacePartRating; // 眉眼
    bixiang: FacePartRating; // 鼻相
    kouxiang: FacePartRating; // 口相
    dige: FacePartRating; // 地阁（下巴）
  };
  xingge: string; // 性格分析
  shiye: string; // 事业运势
  caiyun: string; // 财运分析
  ganqing: string; // 感情分析
  jiankang: string; // 健康提示
  jianyi: string[]; // 改善建议
}

const PALM_SYSTEM_PROMPT = `你是「易知先生」，一位精通手相学的相术大师，深谙《神相全编·手相篇》《麻衣相法·掌纹》《柳庄相法》等手相经典。

你的风格：
- 以掌纹三大主线（生命线、智慧线、感情线）为本，结合其他辅助纹路综合分析
- 语言专业但通俗易懂，让现代人能理解手相学的智慧
- 基于掌纹特征客观分析，不做绝对论断
- 注重实用指导，给出积极的改善建议

你的原则：
- 三大主线（生命线/智慧线/感情线）是核心分析依据
- 辅助线（事业线、太阳线、婚姻线等）补充判断
- 手掌形态（地丘、指节）与性格关联
- 左手看先天，右手看后天（男左女右为传统说法，但现代相学两手兼看）
- 不做绝对论断，多用"掌纹显示"、"宜"、"需留意"
- 给出积极向上的改善建议`;

export interface PalmLineRating {
  score: number; // 1-10 评分
  desc: string; // 简短描述，如"深长清晰"
}

export interface PalmAiResult {
  score: number;
  zonglun: string; // 手相总论
  shengmingxian: string; // 生命线分析
  zhihuixian: string; // 智慧线分析
  ganqingxian: string; // 感情线分析
  shiyexian: string; // 事业线分析
  ratings: {
    // 四大主线评级
    shengmingxian: PalmLineRating;
    zhihuixian: PalmLineRating;
    ganqingxian: PalmLineRating;
    shiyexian: PalmLineRating;
  };
  xingge: string; // 性格分析
  caiyun: string; // 财运分析
  ganqing: string; // 感情婚姻
  jiankang: string; // 健康提示
  jianyi: string[]; // 改善建议
}

const TONGUE_SYSTEM_PROMPT = `你是「易知先生」，一位精通中医舌诊的养生专家，深谙《黄帝内经》《伤寒论》《金匮要略》等中医经典。

你的风格：
- 以舌质、舌苔、舌形为本，结合中医理论进行分析
- 语言专业但通俗易懂，让现代人能理解舌诊的智慧
- 基于舌象特征客观分析，不做绝对论断
- 注重实用指导，给出积极的养生建议

你的原则：
- 舌质（颜色、形态）反映脏腑气血状况
- 舌苔（厚薄、颜色、润燥）反映病邪深浅
- 舌形（胖瘦、齿痕、裂纹）反映体质特征
- 结合舌象综合判断健康状况和体质类型
- 不做绝对论断，多用"舌象显示"、"宜"、"需留意"
- 给出饮食调理和养生建议`;

export interface TonguePartRating {
  score: number; // 1-10 评分
  desc: string; // 简短描述
}

export interface TongueAiResult {
  score: number;
  zonglun: string; // 舌诊总论
  shezhi: string; // 舌质分析
  shetai: string; // 舌苔分析
  shexing: string; // 舌形分析
  ratings: {
    // 舌相评级
    shezhi: TonguePartRating; // 舌质
    shetai: TonguePartRating; // 舌苔
    shexing: TonguePartRating; // 舌形
    shetai_houbo: TonguePartRating; // 苔厚薄
    shetai_runzao: TonguePartRating; // 苔润燥
  };
  jiankang: string; // 健康状况
  tizhipanduan: string; // 体质判断
  yinshi: string; // 饮食建议
  yangsheng: string; // 养生建议
  jianyi: string[]; // 调理建议
}

const FENGSHUI_SYSTEM_PROMPT = `你是「易知先生」，一位精通风水堪舆的玄学大师，深谙《八宅明镜》《阳宅三要》《沈氏玄空学》《葬经》等风水经典。

你的风格：
- 以八宅法为主，结合玄空飞星、峦头理气综合分析
- 语言专业但通俗易懂，让现代人能理解风水学的实用价值
- 基于户型结构与朝向客观分析，不做恐吓式论断
- 注重实用指导，给出具体可操作的风水优化方案

你的原则：
- 依据八宅明镜划分东四宅/西四宅，匹配户主命卦
- 分析大门、主卧、厨房（阳宅三要）的方位吉凶
- 结合五行生克与方位关系给出调和建议
- 注意煞气（路冲、角煞、反弓等）与化解方法
- 不做绝对论断，多用"风水显示"、"宜"、"建议调整"
- 给出积极的改善方案与布局建议`;

const DREAM_SYSTEM_PROMPT = `你是「易知先生」，一位精通周公解梦的梦境分析大师，深谙《周公解梦》《梦林玄解》《断梦秘书》等梦兆经典。

你的风格：
- 以传统梦兆为基础，结合心理学与现代生活场景综合分析
- 语言专业但通俗易懂，既有传统智慧又贴近现代人的生活
- 深入挖掘梦境中的象征意义和潜意识信息
- 注重实用指导，给出具体可行的建议

你的原则：
- 梦境元素分析要细致入微，不遗漏重要细节
- 结合梦境情绪、场景、人物关系综合判断
- 从财运、事业、感情、健康、人际等多维度解析
- 既要尊重传统梦兆，也要结合现代心理学解读
- 不做绝对论断，多用"梦境显示"、"暗示"、"需留意"
- 给出积极的改善建议和行动指引`;

export interface DreamAiResult {
  zonglun: string; // 梦境总论
  yuansu: string; // 梦境元素分析
  qingxu: string; // 情绪与心理状态
  caiyun: string; // 财运解析
  shiye: string; // 事业解析
  ganqing: string; // 感情解析
  jiankang: string; // 健康解析
  renji: string; // 人际关系
  jixiong: string; // 吉凶判断
  jianyi: string[]; // 行动建议
}

export interface FengshuiAreaRating {
  score: number; // 1-10 评分
  desc: string; // 简短描述，如"格局方正"
}

export interface FengshuiAiResult {
  score: number;
  zonglun: string; // 风水总论
  bazhai: string; // 八宅分析（东四宅/西四宅、宅命配合）
  damen: string; // 大门方位分析
  zhuwo: string; // 主卧方位分析
  chufang: string; // 厨房方位分析
  ratings: {
    // 各区域评级
    damen: FengshuiAreaRating; // 大门
    zhuwo: FengshuiAreaRating; // 主卧
    chufang: FengshuiAreaRating; // 厨房
    keting: FengshuiAreaRating; // 客厅
    weishengjian: FengshuiAreaRating; // 卫生间
  };
  caiyun: string; // 财位分析
  shaye: string; // 煞气与化解
  buju: string; // 布局优化建议
  jianyi: string[]; // 改善建议
}

export interface AiInterpretation {
  score: number;
  mingju: string; // 命局概述
  xingge: string; // 性格分析
  shiye: string; // 事业分析（未来3年）
  caiyun: string; // 财运分析（未来3年）
  ganqing: string; // 感情婚姻（夫妻宫、桃花星、正缘）
  jiankang: string; // 健康提示
  liunian: string; // 流年运势
  yanzheng: string; // 过往事件验证
  advice: {
    luckyColor: string[];
    luckyNumber: number[];
    luckyDirection: string;
    suitable: string[];
    avoid: string[];
    luckyElement: string;
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly visionModel: string;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      baseURL: config.get('DMXAPI_BASE_URL', 'https://www.dmxapi.cn/v1'),
      apiKey: config.get('DMXAPI_API_KEY', ''),
    });
    this.model = config.get('DMXAPI_MODEL', 'deepseek-chat');
    this.visionModel = config.get('DMXAPI_VISION_MODEL', 'gpt-4o-mini');
  }

  /** 调用 AI 解读八字 */
  async interpret(
    bazi: BaZiResult,
    name: string,
    gender: number,
    question?: string,
  ): Promise<AiInterpretation> {
    const genderStr = gender === 1 ? '男' : '女';
    const userPrompt = this.buildPrompt(bazi, name, genderStr, question);

    try {
      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        { timeout: 60000 },
      );

      const content = response.choices[0]?.message?.content || '';
      return this.parseResponse(content);
    } catch (error) {
      this.logger.error('AI 解读失败', error);
      return this.fallbackResult(bazi);
    }
  }

  private buildPrompt(
    bazi: BaZiResult,
    name: string,
    gender: string,
    question?: string,
  ): string {
    const {
      siZhu,
      wuXingCount,
      wuXingLack,
      riZhu,
      riZhuWuXing,
      shenQiangRuo,
      yongShen,
      jiShen,
      geJu,
      lunarInfo,
    } = bazi;
    return `请为以下命主进行八字详批：

【基本信息】
姓名：${name}
性别：${gender}
生肖：${lunarInfo.shengXiao}
星座：${lunarInfo.xingZuo}
农历：${lunarInfo.lunarYear} ${lunarInfo.lunarMonth} ${lunarInfo.lunarDay}

【八字四柱】
年柱：${siZhu.year.tianGan}${siZhu.year.diZhi}（${siZhu.year.naYin}）- ${siZhu.year.shiShen}
月柱：${siZhu.month.tianGan}${siZhu.month.diZhi}（${siZhu.month.naYin}）- ${siZhu.month.shiShen}
日柱：${siZhu.day.tianGan}${siZhu.day.diZhi}（${siZhu.day.naYin}）- 日主
时柱：${siZhu.hour.tianGan}${siZhu.hour.diZhi}（${siZhu.hour.naYin}）- ${siZhu.hour.shiShen}

【命理要素】
日主：${riZhu}（${riZhuWuXing}）
身强弱：${shenQiangRuo}
五行统计：金${wuXingCount['金']} 木${wuXingCount['木']} 水${wuXingCount['水']} 火${wuXingCount['火']} 土${wuXingCount['土']}
五行缺失：${wuXingLack.length > 0 ? wuXingLack.join('、') : '无'}
用神：${yongShen}
忌神：${jiShen}
格局：${geJu}
${question ? `\n【用户提问】\n${question}` : ''}

请以 JSON 格式返回分析结果，格式如下（不要包含 markdown 代码块标记）：
{
  "score": 75,
  "mingju": "命局概述，定格局、分析五行强弱、指出喜用神及禁忌五行，300字左右",
  "xingge": "性格分析，直接犀利，200字左右",
  "shiye": "你为高盛风水顾问，结合奇门断投资吉凶。需：定位财库方位（丑未辰戌）及开库流年；分析2025-2027年禄存位置；给出3条行业禁忌（例：水命忌电子属火）；验证2023年是否升职/离职（需月份精确）。300字左右",
  "caiyun": "未来3年财运趋势，结合大运流年，300字左右",
  "ganqing": "感情婚姻详析，分析夫妻宫、桃花星、正缘出现时间及特征，300字左右",
  "jiankang": "健康提示，100字左右",
  "liunian": "今年流年运势，200字左右",
  "yanzheng": "用过往事件验证准确性，如2025年是否换工作、感情变动等，200字左右",
  "advice": {
    "luckyColor": ["红色", "紫色"],
    "luckyNumber": [3, 8],
    "luckyDirection": "南方",
    "suitable": ["宜做的事1", "宜做的事2"],
    "avoid": ["忌做的事1", "忌做的事2"],
    "luckyElement": "火"
  }
}`;
  }

  /** 解析 AI 返回的 JSON，兼容 markdown 代码块 */
  private parseResponse(content: string): AiInterpretation {
    return this.safeParseJson<AiInterpretation>(content);
  }

  /** 通用 JSON 解析，处理 markdown 代码块、截断、特殊字符等 */
  public safeParseJson<T>(content: string): T {
    let cleaned = content.trim();
    // 去除 markdown 代码块
    cleaned = cleaned
      .replace(/^```(?:json)?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '');
    // 尝试直接解析
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      this.logger.warn('直接解析失败，原始内容末尾:', cleaned.slice(-200));
      // 提取最外层 JSON 对象
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        let json = match[0];
        // 修复常见问题：末尾截断的数组/对象
        try {
          return JSON.parse(json) as T;
        } catch {
          // 尝试修复截断的 JSON
          // 1. 去掉末尾不完整的字符串值（截断在引号内）
          json = json.replace(/,\s*"[^"]*$/, '');
          // 2. 去掉末尾不完整的键值对（截断在冒号后）
          json = json.replace(/,\s*"[^"]*"\s*:\s*"?[^"}\]]*$/, '');
          // 3. 去掉末尾不完整的对象（截断在 { 后）
          json = json.replace(/,\s*\{[^}]*$/, '');
          // 4. 去掉末尾多余逗号
          json = json.replace(/,\s*$/, '');
          // 5. 补全未闭合的括号（按栈顺序）
          const stack: string[] = [];
          let inStr = false;
          let escape = false;
          for (const ch of json) {
            if (escape) {
              escape = false;
              continue;
            }
            if (ch === '\\') {
              escape = true;
              continue;
            }
            if (ch === '"') {
              inStr = !inStr;
              continue;
            }
            if (inStr) continue;
            if (ch === '{') stack.push('}');
            else if (ch === '[') stack.push(']');
            else if (ch === '}' || ch === ']') stack.pop();
          }
          json += stack.reverse().join('');
          try {
            return JSON.parse(json) as T;
          } catch (e) {
            this.logger.warn('JSON 修复后仍无法解析', e);
            throw new Error('无法解析 AI 返回的 JSON');
          }
        }
      }
      throw new Error('AI 返回内容中未找到 JSON');
    }
  }

  /** AI 调用失败时的兜底结果 */
  private fallbackResult(bazi: BaZiResult): AiInterpretation {
    return {
      score: 70,
      mingju: `日主${bazi.riZhu}（${bazi.riZhuWuXing}），${bazi.shenQiangRuo}，${bazi.geJu}。五行${bazi.wuXingLack.length > 0 ? '缺' + bazi.wuXingLack.join('') : '齐全'}，用神为${bazi.yongShen}。`,
      xingge: '命主性格待 AI 详细分析。',
      shiye: '事业运势待 AI 详细分析。',
      caiyun: '财运走势待 AI 详细分析。',
      ganqing: '感情运势待 AI 详细分析。',
      jiankang: '健康状况待 AI 详细分析。',
      liunian: '流年运势待 AI 详细分析。',
      yanzheng: '过往验证待 AI 详细分析。',
      advice: {
        luckyColor: ['红色'],
        luckyNumber: [6, 8],
        luckyDirection: '南方',
        suitable: ['静心思考', '稳步前行'],
        avoid: ['冲动决策'],
        luckyElement: bazi.yongShen,
      },
    };
  }

  /** 梅花易数 AI 解读 */
  async interpretMeihua(meihua: MeihuaResult): Promise<MeihuaAiResult> {
    const prompt = `请为以下梅花易数起卦结果进行人生解读：

【起卦者】${meihua.name}
【康熙笔画】${meihua.strokes.map((s) => `${s.char}(${s.stroke}画)`).join(' ')}
【姓笔画】${meihua.xingTotal}画 → 上卦  【名笔画】${meihua.mingTotal}画 → 下卦  【总笔画】${meihua.totalStrokes}画 → 动爻第${meihua.dongYao}爻

【本卦】${meihua.benGua.name}（卦辞：${meihua.benGua.guaci}）
【上卦】${meihua.shangGua.name}（${meihua.shangGua.xiangtian}·${meihua.shangGua.wuxing}）
【下卦】${meihua.xiaGua.name}（${meihua.xiaGua.xiangtian}·${meihua.xiaGua.wuxing}）
【变卦】${meihua.bianGua.name}（卦辞：${meihua.bianGua.guaci}）
【互卦】${meihua.huGua.name}（卦辞：${meihua.huGua.guaci}）

请结合卦象、卦辞、上下卦五行生克、动爻变化，从以下维度解读此人的人生格局：

以 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "zonglun": "卦象总论，结合本卦含义解读此人整体人生格局，200字左右",
  "shiye": "事业发展方向与建议，结合上下卦关系，150字左右",
  "caiyun": "财运分析，结合卦象五行生克，150字左右",
  "ganqing": "感情婚姻，结合卦象阴阳关系，150字左右",
  "guiren": "贵人方位与助力，结合卦象方位，100字左右",
  "jinggao": "卦象警示，结合变卦和动爻，100字左右",
  "jianyi": ["具体建议1", "具体建议2", "具体建议3"]
}`;

    try {
      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: 'system', content: MEIHUA_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        { timeout: 60000 },
      );

      const content = response.choices[0]?.message?.content || '';
      return this.parseMeihuaResponse(content);
    } catch (error) {
      this.logger.error('梅花易数 AI 解读失败', error);
      return this.meihuaFallback(meihua);
    }
  }

  private parseMeihuaResponse(content: string): MeihuaAiResult {
    return this.safeParseJson<MeihuaAiResult>(content);
  }

  private meihuaFallback(meihua: MeihuaResult): MeihuaAiResult {
    return {
      zonglun: `本卦${meihua.benGua.name}，上${meihua.shangGua.name}下${meihua.xiaGua.name}，动爻第${meihua.dongYao}爻，变卦${meihua.bianGua.name}。`,
      shiye: '事业运势待 AI 详细分析。',
      caiyun: '财运走势待 AI 详细分析。',
      ganqing: '感情运势待 AI 详细分析。',
      guiren: `贵人方位：${meihua.shangGua.fangwei}、${meihua.xiaGua.fangwei}。`,
      jinggao: '请留意变卦所示之变化。',
      jianyi: ['顺势而为', '谨慎决策', '广结善缘'],
    };
  }

  /** 紫微斗数 AI 解读 */
  async interpretZiwei(
    ziwei: ZiweiResult,
    name: string,
    birthplace?: string,
    lat?: number,
    lng?: number,
  ): Promise<ZiweiAiResult> {
    const palaceInfo = ziwei.palaces
      .map((p) => {
        const majors =
          p.majorStars.map((s) => `${s.name}(${s.brightness})`).join('、') ||
          '无主星';
        const minors = p.minorStars.length > 0 ? p.minorStars.join('、') : '无';
        return `${p.name}（${p.heavenlyStem}${p.earthlyBranch}）：主星[${majors}] 辅星[${minors}]`;
      })
      .join('\n');

    const birthplaceInfo = birthplace
      ? `\n出生地：${birthplace}${lat != null && lng != null ? `（经度${lng.toFixed(2)}° 纬度${lat.toFixed(2)}°）` : ''}`
      : '';

    const prompt = `请为以下紫微斗数命盘进行详细解读：

【基本信息】
姓名：${name}
性别：${ziwei.gender}
阳历：${ziwei.solarDate}
农历：${ziwei.lunarDate}
生肖：${ziwei.zodiac}
星座：${ziwei.sign}${birthplaceInfo}

【命盘要素】
命主星：${ziwei.soul}
身主星：${ziwei.body}
五行局：${ziwei.fiveElementsClass}
命宫主星：${ziwei.mingMainStar}

【十二宫星曜分布】
${palaceInfo}

请以 JSON 格式返回分析结果（不要包含 markdown 代码块标记）：
{
  "score": 75,
  "zonglun": "命盘总论，标注主要星曜庙陷状态，结合命宫主星和整体格局，300字左右",
  "xingge": "性格分析，结合命宫星曜庙陷，直接犀利，200字左右",
  "mingqian": "命迁线分析，命宫与迁移宫星曜对照，吉凶应期，300字左右",
  "fuguanxian": "夫官线分析，夫妻宫与官禄宫星曜对照，吉凶应期，感情与事业联动，300字左右",
  "caiyun": "财运分析，结合财帛宫与田宅宫星曜，300字左右",
  "jiankang": "健康提示，结合疾厄宫星曜，100字左右",
  "liunian": "未来五年流年分析，指出最强流年及流禄流化走向（如2027年流禄入田宅），300字左右",
  "yanzheng": "验证2019年是否有房产变动或长辈手术，需精确到月份，200字左右",
  "advice": {
    "suitable": ["宜做的事1", "宜做的事2"],
    "avoid": ["忌做的事1", "忌做的事2"],
    "luckyDirection": "吉利方位",
    "luckyElement": "幸运五行"
  }
}`;

    try {
      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: 'system', content: ZIWEI_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        { timeout: 60000 },
      );

      const content = response.choices[0]?.message?.content || '';
      return this.parseZiweiResponse(content);
    } catch (error) {
      this.logger.error('紫微斗数 AI 解读失败', error);
      return this.ziweiFallback(ziwei);
    }
  }

  private parseZiweiResponse(content: string): ZiweiAiResult {
    return this.safeParseJson<ZiweiAiResult>(content);
  }

  private ziweiFallback(ziwei: ZiweiResult): ZiweiAiResult {
    return {
      score: 70,
      zonglun: `命宫主星${ziwei.mingMainStar}，${ziwei.fiveElementsClass}，命主${ziwei.soul}，身主${ziwei.body}。`,
      xingge: '性格待 AI 详细分析。',
      mingqian: '命迁线待 AI 详细分析。',
      fuguanxian: '夫官线待 AI 详细分析。',
      caiyun: '财运待 AI 详细分析。',
      jiankang: '健康待 AI 详细分析。',
      liunian: '流年运势待 AI 详细分析。',
      yanzheng: '',
      advice: {
        suitable: ['稳步前行'],
        avoid: ['冲动决策'],
        luckyDirection: '南方',
        luckyElement: '火',
      },
    };
  }

  /** 奇门遁甲 AI 解读 */
  async interpretQimen(
    qimen: QimenResult,
    name: string,
  ): Promise<QimenAiResult> {
    const palaceInfo = qimen.palaces
      .map(
        (p) =>
          `${p.position}宫(${p.trigram}): 天盘${p.heavenlyStem} 地盘${p.earthlyStem} ${p.star}(${p.starStatus}) ${p.gate}(${p.gateStatus}) ${p.deity}${p.isZhiFu ? ' [值符]' : ''}${p.isZhiShi ? ' [值使]' : ''}${p.gatePressure !== '无' ? ' [门迫]' : ''}`,
      )
      .join('\n');

    const auspStr =
      qimen.auspicious
        .map((a) => `${a.name}(${a.type}) - ${a.description}`)
        .join('\n') || '无';
    const inausStr =
      qimen.inauspicious
        .map((a) => `${a.name}(${a.type}) - ${a.description}`)
        .join('\n') || '无';

    const fp = qimen.fourPillars;
    const prompt = `请为以下奇门遁甲盘面进行人生解读：

【求测者】${name}
【排盘时间】${qimen.timeInfo.solarDate} ${qimen.timeInfo.timeName}
【农历】${qimen.timeInfo.lunarDate}
【节气】${qimen.timeInfo.solarTerm}
【四柱】${fp.year.stem}${fp.year.branch} ${fp.month.stem}${fp.month.branch} ${fp.day.stem}${fp.day.branch} ${fp.hour.stem}${fp.hour.branch}

【局数】${qimen.ju.type}${qimen.ju.number}局 ${qimen.yuan}
【值符】${qimen.zhiFu.star}（${qimen.zhiFu.heavenlyStem}）落${qimen.zhiFu.position}宫
【值使】${qimen.zhiShi.gate} 落${qimen.zhiShi.position}宫
【旬首】${qimen.timeInfo.xunShou}
【空亡】${qimen.timeInfo.voidness.join('、')}
【驿马】${qimen.postHorse.branch}（${qimen.postHorse.position}宫）

【九宫盘面】
${palaceInfo}

【吉格】
${auspStr}

【凶格】
${inausStr}

请结合盘面信息，从以下维度解读：

以 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "zonglun": "盘面总论，结合局数、值符值使、整体格局，200字左右",
  "shiye": "事业分析，重点看开门所在宫位，200字左右",
  "caiyun": "财运分析，重点看生门所在宫位，200字左右",
  "ganqing": "感情分析，重点看休门和六合所在宫位，150字左右",
  "jiankang": "健康提示，重点看天芮星和死门，100字左右",
  "chuxing": "出行方位建议，结合吉门吉格所在方位，100字左右",
  "jixiong": "吉凶总断，综合吉凶格局，150字左右",
  "jianyi": ["具体建议1", "具体建议2", "具体建议3"]
}`;

    try {
      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: 'system', content: QIMEN_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        { timeout: 60000 },
      );

      const content = response.choices[0]?.message?.content || '';
      return this.parseQimenResponse(content);
    } catch (error) {
      this.logger.error('奇门遁甲 AI 解读失败', error);
      return this.qimenFallback(qimen);
    }
  }

  private parseQimenResponse(content: string): QimenAiResult {
    return this.safeParseJson<QimenAiResult>(content);
  }

  private qimenFallback(qimen: QimenResult): QimenAiResult {
    return {
      zonglun: `${qimen.ju.type}${qimen.ju.number}局，${qimen.yuan}，值符${qimen.zhiFu.star}落${qimen.zhiFu.position}宫。`,
      shiye: '事业待 AI 详细分析。',
      caiyun: '财运待 AI 详细分析。',
      ganqing: '感情待 AI 详细分析。',
      jiankang: '健康待 AI 详细分析。',
      chuxing: '出行方位待 AI 详细分析。',
      jixiong: '吉凶待 AI 详细分析。',
      jianyi: ['顺势而为', '谨慎决策', '广结善缘'],
    };
  }

  /** 六爻 AI 解读 */
  async interpretLiuyao(
    liuyao: LiuyaoResult,
    question: string,
  ): Promise<LiuyaoAiResult> {
    const o = liuyao.origin;
    const c = liuyao.changed;
    const movingDesc =
      liuyao.movingIndexes.length > 0
        ? liuyao.movingIndexes.map((i) => o.lineTexts[i]?.label).join('、') +
          ' 动'
        : '无动爻（静卦）';

    const yaoLines = o.ganzhi
      .map((gz, i) => {
        const moving = liuyao.movingIndexes.includes(i) ? ' [动]' : '';
        const shiying =
          i === o.shi - 1 ? ' [世]' : i === o.ying - 1 ? ' [应]' : '';
        return `${o.lineTexts[i]?.label} ${gz} ${o.relation[i]} ${liuyao.gods[i] || ''}${shiying}${moving}`;
      })
      .reverse()
      .join('\n');

    const changedInfo = c
      ? `\n【变卦】${c.name}（${c.upper.nick}${c.lower.nick}） ${c.symbol}\n卦辞：${c.judgement}`
      : '';

    const prompt = `请为以下六爻卦象进行解读：

【求测问题】${question}
【排卦时间】${liuyao.timeGanzhi}

【本卦】${o.name}（${o.upper.nick}${o.lower.nick}） ${o.symbol}
卦辞：${o.judgement}
大象：${o.text}
卦宫：${o.wuxing} 世爻第${o.shi}爻 应爻第${o.ying}爻
${changedInfo}

【动爻】${movingDesc}

【爻位详情】（从上到下）
${yaoLines}

请结合卦象、世应、六亲、六神、动爻变化，针对所问之事进行解读。

以 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "zhiduan": "直断：用一句话（30字以内）直接给出最核心的判断，简单明确，如：此事可成，但需等待时机；或：目前不利，建议暂缓",
  "duanyu": "断语总论，综合卦象对所问之事的判断，200字左右",
  "yongshen": "用神分析，找出用神及其旺衰状态，150字左右",
  "shiye": "事业/所问之事的具体分析，200字左右",
  "caiyun": "财运分析，150字左右",
  "ganqing": "感情/人际分析，150字左右",
  "jixiong": "吉凶判断与时机，150字左右",
  "shiji": "时机建议，何时行动为宜，100字左右",
  "jianyi": ["具体建议1", "具体建议2", "具体建议3"]
}`;

    try {
      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: 'system', content: LIUYAO_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        { timeout: 60000 },
      );

      const content = response.choices[0]?.message?.content || '';
      return this.safeParseJson<LiuyaoAiResult>(content);
    } catch (error) {
      this.logger.error('六爻 AI 解读失败', error);
      return this.liuyaoFallback(liuyao);
    }
  }

  private liuyaoFallback(liuyao: LiuyaoResult): LiuyaoAiResult {
    const o = liuyao.origin;
    return {
      zhiduan: '卦象待详细分析，请稍后重试。',
      duanyu: `本卦${o.name}，${o.upper.nick}上${o.lower.nick}下，${o.judgement}`,
      yongshen: '用神待 AI 详细分析。',
      shiye: '事业待 AI 详细分析。',
      caiyun: '财运待 AI 详细分析。',
      ganqing: '感情待 AI 详细分析。',
      jixiong: '吉凶待 AI 详细分析。',
      shiji: '时机待 AI 详细分析。',
      jianyi: ['静观其变', '顺势而为', '谨慎行事'],
    };
  }

  /** 易经占卜 AI 解读 */
  async interpretYijing(
    yijing: YijingResult,
    question: string,
  ): Promise<YijingAiResult> {
    const o = yijing.origin;
    const yaoDesc = yijing.yaos
      .map(
        (y, i) =>
          `${y.position}（${y.value === 9 ? '老阳' : y.value === 6 ? '老阴' : y.value === 7 ? '少阳' : '少阴'}${y.isMoving ? '·动' : ''}）：${y.text}`,
      )
      .reverse()
      .join('\n');

    const changedInfo = yijing.changed
      ? `\n【变卦】${yijing.changed.symbol} ${yijing.changed.name}\n卦辞：${yijing.changed.judgement}\n大象：${yijing.changed.text}`
      : '';

    const focusInfo =
      yijing.focus.length > 0 ? yijing.focus.join('\n') : '以本卦卦辞为主';

    const prompt = `请为以下易经卦象进行义理解读：

【求问】${question}

【本卦】${o.symbol} ${o.name}（${o.upper.nick}上${o.lower.nick}下）
卦辞：${o.judgement}
大象：${o.text}
${changedInfo}

【动爻数】${yijing.movingCount}爻变
【断卦规则】${yijing.rule}

【爻辞】（从上到下）
${yaoDesc}

【重点参看】
${focusInfo}

请从义理角度解读此卦，重点阐释卦象蕴含的哲理和对所问之事的启示。

以 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "guaxiang": "卦象解读，结合上下卦象、卦名含义，200字左右",
  "yili": "义理阐释，此卦蕴含的核心哲理，可引用彖传象传，200字左右",
  "qishi": "针对所问之事的人生启示，200字左右",
  "chushi": "处世智慧，从卦象中提炼的行动哲学，150字左右",
  "yaoci": "重点爻辞的白话解读与现实映照，200字左右",
  "jianyi": ["行动指引1", "行动指引2", "行动指引3"]
}`;

    try {
      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: 'system', content: YIJING_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        { timeout: 60000 },
      );

      const content = response.choices[0]?.message?.content || '';
      return this.safeParseJson<YijingAiResult>(content);
    } catch (error) {
      this.logger.error('易经 AI 解读失败', error);
      return this.yijingFallback(yijing);
    }
  }

  private yijingFallback(yijing: YijingResult): YijingAiResult {
    const o = yijing.origin;
    return {
      guaxiang: `${o.name}，${o.upper.nick}上${o.lower.nick}下。${o.text}`,
      yili: o.judgement,
      qishi: '启示待 AI 详细分析。',
      chushi: '处世智慧待 AI 详细分析。',
      yaoci: yijing.focus.join('\n') || '待 AI 详细分析。',
      jianyi: ['顺天应时', '守正待机', '厚德载物'],
    };
  }

  /** 小六壬 AI 解读 */
  async interpretXiaoliuren(
    result: XiaoliurenResult,
  ): Promise<XiaoliurenAiResult> {
    const prompt = `请为以下小六壬起卦结果进行解读：

【所问之事】${result.question}
【起卦时间】${result.lunarMonthName}${result.lunarDayName} ${result.shichenName}

【三宫六神】
月宫（看大势）：${result.monthShen.name}（${result.monthShen.wuxing}·${result.monthShen.direction}）
日宫（看过程）：${result.dayShen.name}（${result.dayShen.wuxing}·${result.dayShen.direction}）
时宫（看结果）：${result.hourShen.name}（${result.hourShen.wuxing}·${result.hourShen.direction}）

【综合吉凶】${result.jixiong}

【六神诗诀】
月宫 ${result.monthShen.name}：${result.monthShen.poem}
日宫 ${result.dayShen.name}：${result.dayShen.poem}
时宫 ${result.hourShen.name}：${result.hourShen.poem}

请结合三宫六神组合、五行生克、诗诀含义，融合马前课速断之法，针对所问之事进行解读。

以 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "zonglun": "总论，结合三宫六神组合判断所问之事的整体走向，200字左右",
  "guocheng": "过程分析，以日宫六神为主，分析事情发展过程中的关键因素，150字左右",
  "jieguo": "结果判断，以时宫六神为主，判断最终结果与应期，150字左右",
  "maqianke": "马前课速断，以马前课口诀风格对所问之事给出简明速断，包含出行、行事、求财、寻人等相关判断，150字左右",
  "fangwei": "方位建议，结合三宫方位给出有利方位，100字左右",
  "shiji": "时机建议，何时行动为宜，100字左右",
  "jianyi": ["具体建议1", "具体建议2", "具体建议3"]
}`;

    try {
      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: 'system', content: XIAOLIUREN_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        { timeout: 60000 },
      );

      const content = response.choices[0]?.message?.content || '';
      return this.safeParseJson<XiaoliurenAiResult>(content);
    } catch (error) {
      this.logger.error('小六壬 AI 解读失败', error);
      return this.xiaoliurenFallback(result);
    }
  }

  private xiaoliurenFallback(result: XiaoliurenResult): XiaoliurenAiResult {
    return {
      zonglun: `月宫${result.monthShen.name}，日宫${result.dayShen.name}，时宫${result.hourShen.name}，综合${result.jixiong}。`,
      guocheng: '过程待 AI 详细分析。',
      jieguo: '结果待 AI 详细分析。',
      maqianke: `马前课速断：${result.hourShen.name}落时宫，${result.hourShen.poem.slice(0, 20)}`,
      fangwei: `有利方位：${result.hourShen.direction}。`,
      shiji: '时机待 AI 详细分析。',
      jianyi: ['顺势而为', '谨慎决策', '静观其变'],
    };
  }

  private xunwuFallback(result: any): XunwuAiResult {
    const typeText = result.type === 'xunwu' ? '物品' : '人物';
    return {
      zonglun: `月宫${result.monthShen.name}，日宫${result.dayShen.name}，时宫${result.hourShen.name}，综合${result.jixiong}。${result.canFind ? '卦象显示有望找到。' : '卦象显示寻找较难。'}`,
      fangwei: `主要方位：${result.direction}。时宫${result.hourShen.name}落${result.hourShen.direction}，${typeText}当在此方位。`,
      shijian: `时间预测：${result.timeframe}。`,
      keneng: result.canFind
        ? `卦象吉利，${typeText}有望寻回。建议尽快按方位寻找。`
        : `卦象不利，${typeText}寻找较难。但仍需尽力而为，不可轻言放弃。`,
      jianyi: [
        `重点搜寻${result.hourShen.direction}方位`,
        result.canFind ? '抓紧时间寻找' : '扩大搜寻范围',
        '可询问相关人员',
        '保持耐心和信心',
      ],
    };
  }

  /** 择日择吉 AI 解读 */
  async interpretZeji(result: ZejiResult): Promise<ZejiAiResult> {
    const bestInfo =
      result.bestDays
        .slice(0, 5)
        .map(
          (d) =>
            `${d.date}（${d.lunarDate} ${d.weekday}）干支：${d.ganzhi} 建星：${d.jianXing} ${d.isHuangDao ? '黄道' : '黑道'} 评分：${d.score}\n  宜：${d.yi.slice(0, 8).join('、')}\n  忌：${d.ji.slice(0, 6).join('、')}\n  ${d.chongSha}`,
        )
        .join('\n\n') || '未找到匹配的吉日';

    const prompt = `请为以下择日择吉结果进行解读：

【所办事项】${result.eventName}
【查询范围】${result.startDate} 至 ${result.endDate}
【推荐吉日数量】${result.bestDays.length}个

【推荐吉日详情】
${bestInfo}

请结合黄道吉日、十二建星、干支五行、宜忌神煞，对推荐日期进行综合分析。

以 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "zonglun": "总论，对查询范围内的吉日分布做整体评价，200字左右",
  "tuijian": "推荐日期分析，对前3个最佳日期逐一点评，说明为何适合所办事项，300字左右",
  "yiji": "宜忌详解，结合所办事项解释关键宜忌项的含义，200字左右",
  "chongsha": "冲煞提醒，提醒哪些属相的人需要注意回避，150字左右",
  "zhuyi": "注意事项，办事当天的时辰选择、方位禁忌等，150字左右",
  "jianyi": ["具体建议1", "具体建议2", "具体建议3"]
}`;

    try {
      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: 'system', content: ZEJI_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        { timeout: 60000 },
      );

      const content = response.choices[0]?.message?.content || '';
      return this.safeParseJson<ZejiAiResult>(content);
    } catch (error) {
      this.logger.error('择日择吉 AI 解读失败', error);
      return this.zejiFallback(result);
    }
  }

  private zejiFallback(result: ZejiResult): ZejiAiResult {
    const best = result.bestDays[0];
    return {
      zonglun: best
        ? `查询范围内共找到${result.bestDays.length}个吉日，最佳日期为${best.date}（${best.lunarDate}），${best.jianXing}日，黄道吉日。`
        : '查询范围内未找到完全匹配的吉日，建议扩大查询范围。',
      tuijian: '推荐日期待 AI 详细分析。',
      yiji: '宜忌待 AI 详细分析。',
      chongsha: best
        ? `${best.chongSha}，请注意回避。`
        : '冲煞待 AI 详细分析。',
      zhuyi: '注意事项待 AI 详细分析。',
      jianyi: ['选择黄道吉日', '避开冲煞属相', '注意时辰选择'],
    };
  }

  /** 起名改名 AI 解读（取名模式） */
  async interpretNaming(result: NamingResult): Promise<NamingAiResult> {
    const bazi = result.bazi;
    const wxStr = Object.entries(bazi.wuxingCount)
      .map(([k, v]) => `${k}${v}`)
      .join(' ');
    const lackStr =
      bazi.wuxingLack.length > 0 ? bazi.wuxingLack.join('、') : '无';
    const strokesStr = result.recommendStrokes
      .slice(0, 5)
      .map((s) => `${s[0]}+${s[1]}画`)
      .join('、');

    const prompt = `请为以下命主提供起名建议：

【基本信息】
姓氏：${result.surname}
性别：${result.gender === 'male' ? '男' : '女'}
出生：${result.birthYear}年${result.birthMonth}月${result.birthDay}日 ${result.birthHour}时

【八字】${bazi.siZhu}
【日干】${bazi.riGan}（${bazi.riGanWuxing}）
【五行统计】${wxStr}
【五行缺失】${lackStr}
【喜用神】${bazi.xiyong}
【忌神】${bazi.jishen}
【推荐补益五行】${result.recommendWuxing.join('、')}
【推荐笔画组合】${strokesStr}

请根据八字喜用神，结合三才五格数理、音韵字义，为命主推荐5个好名字。每个名字请详细说明取名由来、所引用的典故出处（如诗经、楚辞、唐诗宋词、论语、周易等经典）以及名字简介。

以 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "zonglun": "八字与取名总论，分析命主八字特点和取名方向，200字左右",
  "wuxingfenxi": "五行详细分析，说明为何推荐这些五行用字，200字左右",
  "yongzi": "用字方向建议，推荐哪些偏旁部首和字义方向，150字左右",
  "tuijian": [
    { "name": "姓+名", "pinyin": "拼音", "analysis": "名字解析，含五行、笔画、寓意，100字左右", "youlai": "取名由来，说明为何选用这些字、五行补益逻辑、音韵搭配理由，80字左右", "diangu": "典故出处，说明名字取自哪部经典、哪句原文，以及该典故的文化内涵，100字左右", "jianjie": "名字简介，一句话概括这个名字的整体寓意和气质，30字左右" },
    { "name": "姓+名", "pinyin": "拼音", "analysis": "名字解析", "youlai": "取名由来", "diangu": "典故出处", "jianjie": "名字简介" },
    { "name": "姓+名", "pinyin": "拼音", "analysis": "名字解析", "youlai": "取名由来", "diangu": "典故出处", "jianjie": "名字简介" },
    { "name": "姓+名", "pinyin": "拼音", "analysis": "名字解析", "youlai": "取名由来", "diangu": "典故出处", "jianjie": "名字简介" },
    { "name": "姓+名", "pinyin": "拼音", "analysis": "名字解析", "youlai": "取名由来", "diangu": "典故出处", "jianjie": "名字简介" }
  ],
  "jianyi": ["取名建议1", "取名建议2", "取名建议3"]
}`;

    try {
      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: 'system', content: NAMING_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 5000,
        },
        { timeout: 120000 },
      );

      const content = response.choices[0]?.message?.content || '';
      return this.safeParseJson<NamingAiResult>(content);
    } catch (error) {
      this.logger.error('起名 AI 解读失败', error);
      return this.namingFallback(result);
    }
  }

  private namingFallback(result: NamingResult): NamingAiResult {
    return {
      zonglun: `命主日干${result.bazi.riGan}（${result.bazi.riGanWuxing}），五行${result.bazi.wuxingLack.length > 0 ? '缺' + result.bazi.wuxingLack.join('') : '齐全'}，喜用${result.bazi.xiyong}。`,
      wuxingfenxi: '五行分析待 AI 详细解读。',
      yongzi: `建议选用${result.recommendWuxing.join('、')}属性的字。`,
      tuijian: [],
      jianyi: ['选用喜用神五行的字', '注意三才五格数理', '兼顾音韵字义'],
    };
  }

  /** 起名改名 AI 解读（测名模式） */
  async interpretNamingCheck(
    result: NamingResult,
    name: string,
  ): Promise<NamingCheckAiResult> {
    const bazi = result.bazi;
    const wuge = result.wuge!;
    const wxStr = Object.entries(bazi.wuxingCount)
      .map(([k, v]) => `${k}${v}`)
      .join(' ');
    const nameCharsStr = result
      .nameChars!.map((c) => `${c.char}(${c.stroke}画)`)
      .join(' ');

    const prompt = `请对以下姓名进行详细测评：

【姓名】${result.surname}${name}
【名字笔画】${nameCharsStr}
【性别】${result.gender === 'male' ? '男' : '女'}
【出生】${result.birthYear}年${result.birthMonth}月${result.birthDay}日 ${result.birthHour}时

【八字】${bazi.siZhu}
【日干】${bazi.riGan}（${bazi.riGanWuxing}）
【五行统计】${wxStr}
【喜用神】${bazi.xiyong}
【忌神】${bazi.jishen}

【五格数理】
天格：${wuge.tiange.value}（${wuge.tiange.wuxing}）${wuge.tiange.shuli}
人格：${wuge.renge.value}（${wuge.renge.wuxing}）${wuge.renge.shuli}
地格：${wuge.dige.value}（${wuge.dige.wuxing}）${wuge.dige.shuli}
外格：${wuge.waige.value}（${wuge.waige.wuxing}）${wuge.waige.shuli}
总格：${wuge.zongge.value}（${wuge.zongge.wuxing}）${wuge.zongge.shuli}
三才：${wuge.sancai}

【系统评分】${result.nameScore}分

请综合分析此名字与命主八字的匹配度。

以 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "zonglun": "名字总评，综合评价此名字的优劣，200字左右",
  "wuge": "五格数理分析，逐一点评天人地外总格吉凶，200字左右",
  "wuxing": "五行匹配度分析，名字五行是否补益八字喜用，200字左右",
  "yinyun": "音韵分析，声调搭配、谐音、朗朗上口程度，100字左右",
  "ziyi": "字义解读，每个字的含义与整体寓意，150字左右",
  "score": 75,
  "jianyi": ["改善建议1", "改善建议2", "改善建议3"]
}`;

    try {
      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: 'system', content: NAMING_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        },
        { timeout: 120000 },
      );

      const content = response.choices[0]?.message?.content || '';
      return this.safeParseJson<NamingCheckAiResult>(content);
    } catch (error) {
      this.logger.error('测名 AI 解读失败', error);
      return this.namingCheckFallback(result);
    }
  }

  private namingCheckFallback(result: NamingResult): NamingCheckAiResult {
    const wuge = result.wuge!;
    return {
      zonglun: `三才配置${wuge.sancai}，人格${wuge.renge.value}（${wuge.renge.shuli}），总格${wuge.zongge.value}（${wuge.zongge.shuli}）。`,
      wuge: '五格分析待 AI 详细解读。',
      wuxing: '五行匹配待 AI 详细解读。',
      yinyun: '音韵分析待 AI 详细解读。',
      ziyi: '字义解读待 AI 详细解读。',
      score: result.nameScore || 60,
      jianyi: ['参考五行喜用', '注意数理吉凶', '兼顾音韵美感'],
    };
  }

  /** 合婚配对 AI 解读 */
  async interpretHehun(hehun: HehunResult): Promise<HehunAiResult> {
    const m = hehun.male.bazi;
    const f = hehun.female.bazi;
    const mWxStr = Object.entries(m.wuXingCount)
      .map(([k, v]) => `${k}${v}`)
      .join(' ');
    const fWxStr = Object.entries(f.wuXingCount)
      .map(([k, v]) => `${k}${v}`)
      .join(' ');

    const prompt = `请为以下合婚配对进行详细解读：

【男方】${hehun.male.name}
八字：${m.rawBaZi}
日主：${m.riZhu}（${m.riZhuWuXing}）${m.shenQiangRuo}
生肖：${m.lunarInfo.shengXiao}
五行：${mWxStr}
五行缺：${m.wuXingLack.length > 0 ? m.wuXingLack.join('、') : '无'}
用神：${m.yongShen}  忌神：${m.jiShen}
日柱纳音：${m.siZhu.day.naYin}

【女方】${hehun.female.name}
八字：${f.rawBaZi}
日主：${f.riZhu}（${f.riZhuWuXing}）${f.shenQiangRuo}
生肖：${f.lunarInfo.shengXiao}
五行：${fWxStr}
五行缺：${f.wuXingLack.length > 0 ? f.wuXingLack.join('、') : '无'}
用神：${f.yongShen}  忌神：${f.jiShen}
日柱纳音：${f.siZhu.day.naYin}

【系统评分】
总分：${hehun.overallScore}分（${hehun.overallLevel}）
属相配对：${hehun.dimensions.shuxiang.score}分 - ${hehun.dimensions.shuxiang.detail}
日干配合：${hehun.dimensions.rigan.score}分 - ${hehun.dimensions.rigan.detail}
五行互补：${hehun.dimensions.wuxing.score}分 - ${hehun.dimensions.wuxing.detail}
纳音配合：${hehun.dimensions.nayin.score}分 - ${hehun.dimensions.nayin.detail}

以 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "zonglun": "合婚总论，综合评价双方八字契合度，300字左右",
  "bazihebi": "八字合璧分析，详细对比双方日干、十神关系，250字左右",
  "shuxiang": "属相配对详解，分析生肖关系及影响，200字左右",
  "wuxing": "五行互补分析，双方五行如何互相补益或冲突，200字左右",
  "ganqing": "感情运势，结合双方八字分析感情发展趋势，200字左右",
  "xiangchu": "相处建议，基于八字特点给出日常相处注意事项，200字左右",
  "jianyi": ["具体建议1", "具体建议2", "具体建议3", "具体建议4"]
}`;

    try {
      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: 'system', content: HEHUN_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        { timeout: 120000 },
      );

      const content = response.choices[0]?.message?.content || '';
      return this.safeParseJson<HehunAiResult>(content);
    } catch (error) {
      this.logger.error('合婚 AI 解读失败', error);
      return this.hehunFallback(hehun);
    }
  }

  private hehunFallback(hehun: HehunResult): HehunAiResult {
    return {
      zonglun: `${hehun.male.name}与${hehun.female.name}合婚总分${hehun.overallScore}分，${hehun.overallLevel}。男方日主${hehun.male.bazi.riZhu}（${hehun.male.bazi.riZhuWuXing}），女方日主${hehun.female.bazi.riZhu}（${hehun.female.bazi.riZhuWuXing}）。`,
      bazihebi: '八字合璧待 AI 详细分析。',
      shuxiang: `男方属${hehun.male.bazi.lunarInfo.shengXiao}，女方属${hehun.female.bazi.lunarInfo.shengXiao}，${hehun.dimensions.shuxiang.detail}`,
      wuxing: '五行互补待 AI 详细分析。',
      ganqing: '感情运势待 AI 详细分析。',
      xiangchu: '相处建议待 AI 详细分析。',
      jianyi: ['互相尊重包容', '注意沟通方式', '共同经营感情', '适时化解矛盾'],
    };
  }

  private shengyiFallback(data: any): ShengyiAiResult {
    const s = data;
    return {
      zonglun: `${s.self.name}与${s.partners.map((p: any) => p.name).join('、')}的生意合伙总分${s.overallScore}分，${s.overallLevel}。选择行业${s.industry}（${s.industryWuXing}）。`,
      hehuo: '合伙优势待 AI 详细分析。',
      fengxian: `风险提示：${s.dimensions.leadershipBalance.detail}`,
      bazi: '八字配合待 AI 详细分析。',
      hangye: `行业适合度：${s.dimensions.industrySuitability.detail}`,
      lingdao: `领导力平衡：${s.dimensions.leadershipBalance.detail}`,
      jianyi: [
        '明确分工合作',
        '发挥各自优势',
        '注意五行互补',
        '定期沟通协调',
        '建立决策机制',
      ],
    };
  }

  // ========== 流式 AI 解读 ==========

  /** 获取指定类型的 prompt 配置 */
  getPromptConfig(
    type: string,
    data: any,
    extraParams?: any,
  ): {
    system: string;
    user: string;
    maxTokens: number;
    timeout: number;
    temperature: number;
  } {
    switch (type) {
      case 'bazi': {
        const genderStr = extraParams?.gender === 1 ? '男' : '女';
        return {
          system: SYSTEM_PROMPT,
          user: this.buildPrompt(
            data,
            extraParams?.name ?? '',
            genderStr,
            extraParams?.question,
          ),
          maxTokens: 4000,
          timeout: 60000,
          temperature: 0.7,
        };
      }
      case 'meihua': {
        const m = data;
        const user = `请为以下梅花易数起卦结果进行人生解读：\n\n【起卦者】${m.name}\n【康熙笔画】${m.strokes.map((s: any) => `${s.char}(${s.stroke}画)`).join(' ')}\n【姓笔画】${m.xingTotal}画 → 上卦  【名笔画】${m.mingTotal}画 → 下卦  【总笔画】${m.totalStrokes}画 → 动爻第${m.dongYao}爻\n\n【本卦】${m.benGua.name}（卦辞：${m.benGua.guaci}）\n【上卦】${m.shangGua.name}（${m.shangGua.xiangtian}·${m.shangGua.wuxing}）\n【下卦】${m.xiaGua.name}（${m.xiaGua.xiangtian}·${m.xiaGua.wuxing}）\n【变卦】${m.bianGua.name}（卦辞：${m.bianGua.guaci}）\n【互卦】${m.huGua.name}（卦辞：${m.huGua.guaci}）\n\n请结合卦象、卦辞、上下卦五行生克、动爻变化，从以下维度解读此人的人生格局：\n\n以 JSON 格式返回（不要包含 markdown 代码块标记）：\n{"zonglun":"卦象总论，结合本卦含义解读此人整体人生格局，200字左右","shiye":"事业发展方向与建议，结合上下卦关系，150字左右","caiyun":"财运分析，结合卦象五行生克，150字左右","ganqing":"感情婚姻，结合卦象阴阳关系，150字左右","guiren":"贵人方位与助力，结合卦象方位，100字左右","jinggao":"卦象警示，结合变卦和动爻，100字左右","jianyi":["具体建议1","具体建议2","具体建议3"]}`;
        return {
          system: MEIHUA_SYSTEM_PROMPT,
          user,
          maxTokens: 2000,
          timeout: 60000,
          temperature: 0.7,
        };
      }
      case 'ziwei': {
        const z = data;
        const palaceInfo = z.palaces
          .map((p: any) => {
            const majors =
              p.majorStars
                .map((s: any) => `${s.name}(${s.brightness})`)
                .join('、') || '无主星';
            const minors =
              p.minorStars.length > 0 ? p.minorStars.join('、') : '无';
            return `${p.name}（${p.heavenlyStem}${p.earthlyBranch}）：主星[${majors}] 辅星[${minors}]`;
          })
          .join('\n');
        const bpInfo = extraParams?.birthplace
          ? `\n出生地：${extraParams.birthplace}${extraParams.lat != null && extraParams.lng != null ? `（经度${extraParams.lng.toFixed(2)}° 纬度${extraParams.lat.toFixed(2)}°）` : ''}`
          : '';
        const user = `请为以下紫微斗数命盘进行详细解读：\n\n【基本信息】\n姓名：${extraParams?.name ?? ''}\n性别：${z.gender}\n阳历：${z.solarDate}\n农历：${z.lunarDate}\n生肖：${z.zodiac}\n星座：${z.sign}${bpInfo}\n\n【命盘要素】\n命主星：${z.soul}\n身主星：${z.body}\n五行局：${z.fiveElementsClass}\n命宫主星：${z.mingMainStar}\n\n【十二宫星曜分布】\n${palaceInfo}\n\n请以 JSON 格式返回分析结果（不要包含 markdown 代码块标记）：\n{"score":75,"zonglun":"命盘总论，300字左右","xingge":"性格分析，200字左右","mingqian":"命迁线分析，300字左右","fuguanxian":"夫官线分析，300字左右","caiyun":"财运分析，300字左右","jiankang":"健康提示，100字左右","liunian":"未来五年流年分析，300字左右","yanzheng":"验证2019年是否有房产变动或长辈手术，200字左右","advice":{"suitable":["宜做的事1","宜做的事2"],"avoid":["忌做的事1","忌做的事2"],"luckyDirection":"吉利方位","luckyElement":"幸运五行"}}`;
        return {
          system: ZIWEI_SYSTEM_PROMPT,
          user,
          maxTokens: 4000,
          timeout: 60000,
          temperature: 0.7,
        };
      }
      case 'qimen': {
        const q = data;
        const palaceInfo = q.palaces
          .map(
            (p: any) =>
              `${p.position}宫(${p.trigram}): 天盘${p.heavenlyStem} 地盘${p.earthlyStem} ${p.star}(${p.starStatus}) ${p.gate}(${p.gateStatus}) ${p.deity}${p.isZhiFu ? ' [值符]' : ''}${p.isZhiShi ? ' [值使]' : ''}${p.gatePressure !== '无' ? ' [门迫]' : ''}`,
          )
          .join('\n');
        const auspStr =
          q.auspicious
            .map((a: any) => `${a.name}(${a.type}) - ${a.description}`)
            .join('\n') || '无';
        const inausStr =
          q.inauspicious
            .map((a: any) => `${a.name}(${a.type}) - ${a.description}`)
            .join('\n') || '无';
        const fp = q.fourPillars;
        const user = `请为以下奇门遁甲盘面进行人生解读：\n\n【求测者】${extraParams?.name ?? ''}\n【排盘时间】${q.timeInfo.solarDate} ${q.timeInfo.timeName}\n【农历】${q.timeInfo.lunarDate}\n【节气】${q.timeInfo.solarTerm}\n【四柱】${fp.year.stem}${fp.year.branch} ${fp.month.stem}${fp.month.branch} ${fp.day.stem}${fp.day.branch} ${fp.hour.stem}${fp.hour.branch}\n\n【局数】${q.ju.type}${q.ju.number}局 ${q.yuan}\n【值符】${q.zhiFu.star}（${q.zhiFu.heavenlyStem}）落${q.zhiFu.position}宫\n【值使】${q.zhiShi.gate} 落${q.zhiShi.position}宫\n【旬首】${q.timeInfo.xunShou}\n【空亡】${q.timeInfo.voidness.join('、')}\n【驿马】${q.postHorse.branch}（${q.postHorse.position}宫）\n\n【九宫盘面】\n${palaceInfo}\n\n【吉格】\n${auspStr}\n\n【凶格】\n${inausStr}\n\n以 JSON 格式返回（不要包含 markdown 代码块标记）：\n{"zonglun":"盘面总论，200字左右","shiye":"事业分析，200字左右","caiyun":"财运分析，200字左右","ganqing":"感情分析，150字左右","jiankang":"健康提示，100字左右","chuxing":"出行方位建议，100字左右","jixiong":"吉凶总断，150字左右","jianyi":["具体建议1","具体建议2","具体建议3"]}`;
        return {
          system: QIMEN_SYSTEM_PROMPT,
          user,
          maxTokens: 4000,
          timeout: 60000,
          temperature: 0.7,
        };
      }
      case 'liuyao': {
        const l = data;
        const o = l.origin;
        const c = l.changed;
        const movingDesc =
          l.movingIndexes.length > 0
            ? l.movingIndexes
                .map((i: number) => o.lineTexts[i]?.label)
                .join('、') + ' 动'
            : '无动爻（静卦）';
        const yaoLines = o.ganzhi
          .map((gz: string, i: number) => {
            const moving = l.movingIndexes.includes(i) ? ' [动]' : '';
            const shiying =
              i === o.shi - 1 ? ' [世]' : i === o.ying - 1 ? ' [应]' : '';
            return `${o.lineTexts[i]?.label} ${gz} ${o.relation[i]} ${l.gods[i] || ''}${shiying}${moving}`;
          })
          .reverse()
          .join('\n');
        const changedInfo = c
          ? `\n【变卦】${c.name}（${c.upper.nick}${c.lower.nick}） ${c.symbol}\n卦辞：${c.judgement}`
          : '';
        const user = `请为以下六爻卦象进行解读：\n\n【求测问题】${extraParams?.question ?? ''}\n【排卦时间】${l.timeGanzhi}\n\n【本卦】${o.name}（${o.upper.nick}${o.lower.nick}） ${o.symbol}\n卦辞：${o.judgement}\n大象：${o.text}\n卦宫：${o.wuxing} 世爻第${o.shi}爻 应爻第${o.ying}爻\n${changedInfo}\n\n【动爻】${movingDesc}\n\n【爻位详情】（从上到下）\n${yaoLines}\n\n请结合卦象、世应、六亲、六神、动爻变化，针对所问之事进行解读。\n\n以 JSON 格式返回（不要包含 markdown 代码块标记）：\n{"zhiduan":"直断：用一句话（30字以内）直接给出最核心的判断，简单明确，如：此事可成，但需等待时机；或：目前不利，建议暂缓","duanyu":"断语总论，综合卦象对所问之事的判断，200字左右","yongshen":"用神分析，找出用神及其旺衰状态，150字左右","shiye":"事业/所问之事的具体分析，200字左右","caiyun":"财运分析，150字左右","ganqing":"感情/人际分析，150字左右","jixiong":"吉凶判断与时机，150字左右","shiji":"时机建议，何时行动为宜，100字左右","jianyi":["具体建议1","具体建议2","具体建议3"]}`;
        return {
          system: LIUYAO_SYSTEM_PROMPT,
          user,
          maxTokens: 4000,
          timeout: 60000,
          temperature: 0.7,
        };
      }
      case 'yijing': {
        const y = data;
        const o = y.origin;
        const yaoDesc = y.yaos
          .map(
            (ya: any, i: number) =>
              `${ya.position}（${ya.value === 9 ? '老阳' : ya.value === 6 ? '老阴' : ya.value === 7 ? '少阳' : '少阴'}${ya.isMoving ? '·动' : ''}）：${ya.text}`,
          )
          .reverse()
          .join('\n');
        const changedInfo = y.changed
          ? `\n【变卦】${y.changed.symbol} ${y.changed.name}\n卦辞：${y.changed.judgement}\n大象：${y.changed.text}`
          : '';
        const focusInfo =
          y.focus.length > 0 ? y.focus.join('\n') : '以本卦卦辞为主';
        const user = `请为以下易经卦象进行义理解读：\n\n【求问】${extraParams?.question ?? ''}\n\n【本卦】${o.symbol} ${o.name}（${o.upper.nick}上${o.lower.nick}下）\n卦辞：${o.judgement}\n大象：${o.text}\n${changedInfo}\n\n【动爻数】${y.movingCount}爻变\n【断卦规则】${y.rule}\n\n【爻辞】（从上到下）\n${yaoDesc}\n\n【重点参看】\n${focusInfo}\n\n以 JSON 格式返回（不要包含 markdown 代码块标记）：\n{"guaxiang":"卦象解读，200字左右","yili":"义理阐释，200字左右","qishi":"人生启示，200字左右","chushi":"处世智慧，150字左右","yaoci":"重点爻辞解读，200字左右","jianyi":["行动指引1","行动指引2","行动指引3"]}`;
        return {
          system: YIJING_SYSTEM_PROMPT,
          user,
          maxTokens: 4000,
          timeout: 60000,
          temperature: 0.7,
        };
      }
      case 'xiaoliuren': {
        const x = data;
        const user = `请为以下小六壬起卦结果进行解读：\n\n【所问之事】${x.question}\n【起卦时间】${x.lunarMonthName}${x.lunarDayName} ${x.shichenName}\n\n【三宫六神】\n月宫（看大势）：${x.monthShen.name}（${x.monthShen.wuxing}·${x.monthShen.direction}）\n日宫（看过程）：${x.dayShen.name}（${x.dayShen.wuxing}·${x.dayShen.direction}）\n时宫（看结果）：${x.hourShen.name}（${x.hourShen.wuxing}·${x.hourShen.direction}）\n\n【综合吉凶】${x.jixiong}\n\n【六神诗诀】\n月宫 ${x.monthShen.name}：${x.monthShen.poem}\n日宫 ${x.dayShen.name}：${x.dayShen.poem}\n时宫 ${x.hourShen.name}：${x.hourShen.poem}\n\n以 JSON 格式返回（不要包含 markdown 代码块标记）：\n{"zonglun":"总论，200字左右","guocheng":"过程分析，150字左右","jieguo":"结果判断，150字左右","maqianke":"马前课速断，150字左右","fangwei":"方位建议，100字左右","shiji":"时机建议，100字左右","jianyi":["具体建议1","具体建议2","具体建议3"]}`;
        return {
          system: XIAOLIUREN_SYSTEM_PROMPT,
          user,
          maxTokens: 2000,
          timeout: 60000,
          temperature: 0.7,
        };
      }
      case 'xunwu': {
        const x = data;
        const typeText = x.type === 'xunwu' ? '寻物' : '寻人';
        const targetText =
          x.type === 'xunwu'
            ? `【物品】${x.itemName || '未说明'}`
            : `【人物】${x.personName || '未说明'}`;
        const timeText = x.lostTime ? `\n【丢失时间】${x.lostTime}` : '';
        const placeText = x.lostPlace ? `\n【丢失地点】${x.lostPlace}` : '';
        const user = `请为以下${typeText}卦象进行解读：\n\n【类型】${typeText}\n${targetText}${timeText}${placeText}\n【所问之事】${x.question}\n\n【三宫六神】\n月宫：${x.monthShen.name}（${x.monthShen.wuxing}·${x.monthShen.direction}·${x.monthShen.location}）\n${x.type === 'xunwu' ? x.monthShen.xunwu : x.monthShen.xunren}\n\n日宫：${x.dayShen.name}（${x.dayShen.wuxing}·${x.dayShen.direction}·${x.dayShen.location}）\n${x.type === 'xunwu' ? x.dayShen.xunwu : x.dayShen.xunren}\n\n时宫（终宫）：${x.hourShen.name}（${x.hourShen.wuxing}·${x.hourShen.direction}·${x.hourShen.location}）\n${x.type === 'xunwu' ? x.hourShen.xunwu : x.hourShen.xunren}\n\n【综合判断】\n方位：${x.direction}\n能否找到：${x.canFind ? '有望找到' : '较难寻回'}\n时间预测：${x.timeframe}\n吉凶：${x.jixiong}\n\n以 JSON 格式返回（不要包含 markdown 代码块标记）：\n{"zonglun":"总体分析，200字左右","fangwei":"方位指引，200字左右","shijian":"时间预测，150字左右","keneng":"可能性分析，150字左右","jianyi":["具体建议1","具体建议2","具体建议3","具体建议4"]}`;
        return {
          system: XUNWU_SYSTEM_PROMPT,
          user,
          maxTokens: 2000,
          timeout: 60000,
          temperature: 0.7,
        };
      }
      case 'zeji': {
        const r = data;
        const bestInfo =
          r.bestDays
            .slice(0, 5)
            .map(
              (d: any) =>
                `${d.date}（${d.lunarDate} ${d.weekday}）干支：${d.ganzhi} 建星：${d.jianXing} ${d.isHuangDao ? '黄道' : '黑道'} 评分：${d.score}\n  宜：${d.yi.slice(0, 8).join('、')}\n  忌：${d.ji.slice(0, 6).join('、')}\n  ${d.chongSha}`,
            )
            .join('\n\n') || '未找到匹配的吉日';
        const user = `请为以下择日择吉结果进行解读：\n\n【所办事项】${r.eventName}\n【查询范围】${r.startDate} 至 ${r.endDate}\n【推荐吉日数量】${r.bestDays.length}个\n\n【推荐吉日详情】\n${bestInfo}\n\n以 JSON 格式返回（不要包含 markdown 代码块标记）：\n{"zonglun":"总论，200字左右","tuijian":"推荐日期分析，300字左右","yiji":"宜忌详解，200字左右","chongsha":"冲煞提醒，150字左右","zhuyi":"注意事项，150字左右","jianyi":["具体建议1","具体建议2","具体建议3"]}`;
        return {
          system: ZEJI_SYSTEM_PROMPT,
          user,
          maxTokens: 2000,
          timeout: 60000,
          temperature: 0.7,
        };
      }
      case 'naming': {
        const r = data;
        const bazi = r.bazi;
        const wxStr = Object.entries(bazi.wuxingCount)
          .map(([k, v]) => `${k}${v}`)
          .join(' ');
        const lackStr =
          bazi.wuxingLack.length > 0 ? bazi.wuxingLack.join('、') : '无';
        const strokesStr = r.recommendStrokes
          .slice(0, 5)
          .map((s: any) => `${s[0]}+${s[1]}画`)
          .join('、');
        const user = `请为以下命主提供起名建议：\n\n【基本信息】\n姓氏：${r.surname}\n性别：${r.gender === 'male' ? '男' : '女'}\n出生：${r.birthYear}年${r.birthMonth}月${r.birthDay}日 ${r.birthHour}时\n\n【八字】${bazi.siZhu}\n【日干】${bazi.riGan}（${bazi.riGanWuxing}）\n【五行统计】${wxStr}\n【五行缺失】${lackStr}\n【喜用神】${bazi.xiyong}\n【忌神】${bazi.jishen}\n【推荐补益五行】${r.recommendWuxing.join('、')}\n【推荐笔画组合】${strokesStr}\n\n请根据八字喜用神，结合三才五格数理、音韵字义，为命主推荐5个好名字。每个名字请详细说明取名由来、所引用的典故出处以及名字简介。\n\n以 JSON 格式返回（不要包含 markdown 代码块标记）：\n{"zonglun":"八字与取名总论，200字左右","wuxingfenxi":"五行详细分析，200字左右","yongzi":"用字方向建议，150字左右","tuijian":[{"name":"姓+名","pinyin":"拼音","analysis":"名字解析，100字左右","youlai":"取名由来，80字左右","diangu":"典故出处，100字左右","jianjie":"名字简介，30字左右"}],"jianyi":["取名建议1","取名建议2","取名建议3"]}`;
        return {
          system: NAMING_SYSTEM_PROMPT,
          user,
          maxTokens: 5000,
          timeout: 120000,
          temperature: 0.8,
        };
      }
      case 'namingCheck': {
        const r = data;
        const bazi = r.bazi;
        const wuge = r.wuge;
        const wxStr = Object.entries(bazi.wuxingCount)
          .map(([k, v]) => `${k}${v}`)
          .join(' ');
        const nameCharsStr = r.nameChars
          .map((c: any) => `${c.char}(${c.stroke}画)`)
          .join(' ');
        const user = `请对以下姓名进行详细测评：\n\n【姓名】${r.surname}${extraParams?.name ?? ''}\n【名字笔画】${nameCharsStr}\n【性别】${r.gender === 'male' ? '男' : '女'}\n【出生】${r.birthYear}年${r.birthMonth}月${r.birthDay}日 ${r.birthHour}时\n\n【八字】${bazi.siZhu}\n【日干】${bazi.riGan}（${bazi.riGanWuxing}）\n【五行统计】${wxStr}\n【喜用神】${bazi.xiyong}\n【忌神】${bazi.jishen}\n\n【五格数理】\n天格：${wuge.tiange.value}（${wuge.tiange.wuxing}）${wuge.tiange.shuli}\n人格：${wuge.renge.value}（${wuge.renge.wuxing}）${wuge.renge.shuli}\n地格：${wuge.dige.value}（${wuge.dige.wuxing}）${wuge.dige.shuli}\n外格：${wuge.waige.value}（${wuge.waige.wuxing}）${wuge.waige.shuli}\n总格：${wuge.zongge.value}（${wuge.zongge.wuxing}）${wuge.zongge.shuli}\n三才：${wuge.sancai}\n\n【系统评分】${r.nameScore}分\n\n以 JSON 格式返回（不要包含 markdown 代码块标记）：\n{"zonglun":"名字总评，200字左右","wuge":"五格数理分析，200字左右","wuxing":"五行匹配度分析，200字左右","yinyun":"音韵分析，100字左右","ziyi":"字义解读，150字左右","score":75,"jianyi":["改善建议1","改善建议2","改善建议3"]}`;
        return {
          system: NAMING_SYSTEM_PROMPT,
          user,
          maxTokens: 3000,
          timeout: 120000,
          temperature: 0.7,
        };
      }
      case 'hehun': {
        const h = data;
        const m = h.male.bazi;
        const f = h.female.bazi;
        const mWxStr = Object.entries(m.wuXingCount)
          .map(([k, v]: [string, any]) => `${k}${v}`)
          .join(' ');
        const fWxStr = Object.entries(f.wuXingCount)
          .map(([k, v]: [string, any]) => `${k}${v}`)
          .join(' ');
        const user = `请为以下合婚配对进行详细解读：\n\n【男方】${h.male.name}\n八字：${m.rawBaZi}\n日主：${m.riZhu}（${m.riZhuWuXing}）${m.shenQiangRuo}\n生肖：${m.lunarInfo.shengXiao}\n五行：${mWxStr}\n五行缺：${m.wuXingLack.length > 0 ? m.wuXingLack.join('、') : '无'}\n用神：${m.yongShen}  忌神：${m.jiShen}\n日柱纳音：${m.siZhu.day.naYin}\n\n【女方】${h.female.name}\n八字：${f.rawBaZi}\n日主：${f.riZhu}（${f.riZhuWuXing}）${f.shenQiangRuo}\n生肖：${f.lunarInfo.shengXiao}\n五行：${fWxStr}\n五行缺：${f.wuXingLack.length > 0 ? f.wuXingLack.join('、') : '无'}\n用神：${f.yongShen}  忌神：${f.jiShen}\n日柱纳音：${f.siZhu.day.naYin}\n\n【系统评分】\n总分：${h.overallScore}分（${h.overallLevel}）\n属相配对：${h.dimensions.shuxiang.score}分 - ${h.dimensions.shuxiang.detail}\n日干配合：${h.dimensions.rigan.score}分 - ${h.dimensions.rigan.detail}\n五行互补：${h.dimensions.wuxing.score}分 - ${h.dimensions.wuxing.detail}\n纳音配合：${h.dimensions.nayin.score}分 - ${h.dimensions.nayin.detail}\n\n以 JSON 格式返回（不要包含 markdown 代码块标记）：\n{"zonglun":"合婚总论，300字左右","bazihebi":"八字合璧分析，250字左右","shuxiang":"属相配对详解，200字左右","wuxing":"五行互补分析，200字左右","ganqing":"感情运势，200字左右","xiangchu":"相处建议，200字左右","jianyi":["具体建议1","具体建议2","具体建议3","具体建议4"]}`;
        return {
          system: HEHUN_SYSTEM_PROMPT,
          user,
          maxTokens: 4000,
          timeout: 120000,
          temperature: 0.7,
        };
      }
      case 'shengyi': {
        const s = data;
        const self = s.self;
        const partners = s.partners;
        const selfWxStr = Object.entries(self.bazi.wuXingCount)
          .map(([k, v]: [string, any]) => `${k}${v}`)
          .join(' ');
        const partnersInfo = partners
          .map((p: any) => {
            const pWxStr = Object.entries(p.bazi.wuXingCount)
              .map(([k, v]: [string, any]) => `${k}${v}`)
              .join(' ');
            return `【合伙人】${p.name}
八字：${p.bazi.rawBaZi}
日主：${p.bazi.riZhu}（${p.bazi.riZhuWuXing}）${p.bazi.shenQiangRuo}
生肖：${p.bazi.lunarInfo.shengXiao}
五行：${pWxStr}
五行缺：${p.bazi.wuXingLack.length > 0 ? p.bazi.wuXingLack.join('、') : '无'}
用神：${p.bazi.yongShen}  忌神：${p.bazi.jiShen}
格局：${p.bazi.geJu}`;
          })
          .join('\n\n');

        const user = `请为以下生意合伙进行详细分析：\n\n【甲方】${self.name}
八字：${self.bazi.rawBaZi}
日主：${self.bazi.riZhu}（${self.bazi.riZhuWuXing}）${self.bazi.shenQiangRuo}
生肖：${self.bazi.lunarInfo.shengXiao}
五行：${selfWxStr}
五行缺：${self.bazi.wuXingLack.length > 0 ? self.bazi.wuXingLack.join('、') : '无'}
用神：${self.bazi.yongShen}  忌神：${self.bazi.jiShen}
格局：${self.bazi.geJu}

${partnersInfo}

【选择的行业】${s.industry}（五行属${s.industryWuXing}）

【易经卦象】
本卦：${s.yijing.origin.name} ${s.yijing.origin.symbol}
卦辞：${s.yijing.origin.judgement}
${s.yijing.changed ? `变卦：${s.yijing.changed.name} ${s.yijing.changed.symbol}` : ''}
断卦规则：${s.yijing.rule}

【系统评分】
总分：${s.overallScore}分（${s.overallLevel}）
五行匹配：${s.dimensions.wuxingMatch.score}分 - ${s.dimensions.wuxingMatch.detail}
八字和谐：${s.dimensions.baziHarmony.score}分 - ${s.dimensions.baziHarmony.detail}
行业适合：${s.dimensions.industrySuitability.score}分 - ${s.dimensions.industrySuitability.detail}
领导平衡：${s.dimensions.leadershipBalance.score}分 - ${s.dimensions.leadershipBalance.detail}

【综合建议】
${s.recommendation}

以 JSON 格式返回（不要包含 markdown 代码块标记）：
{"zonglun":"合伙总论，300字左右","hehuo":"合伙优势详细分析，250字左右","fengxian":"风险提示与注意事项，250字左右","bazi":"八字配合深度解读，200字左右","hangye":"行业适合度与五行调整建议，200字左右","lingdao":"领导力分工与权力平衡建议，200字左右","jianyi":["合作建议1","合作建议2","合作建议3","合作建议4","合作建议5"]}`;
        return {
          system: SHENGYI_SYSTEM_PROMPT,
          user,
          maxTokens: 4000,
          timeout: 120000,
          temperature: 0.7,
        };
      }
      case 'face': {
        const genderInfo =
          data.gender && data.gender !== '未知' ? `\n性别：${data.gender}` : '';
        const birthInfo = data.birthYear
          ? `\n出生年份：${data.birthYear}年（${new Date().getFullYear() - data.birthYear}岁左右）`
          : '';
        const user = `请根据照片中的面部特征进行面相分析：\n${genderInfo}${birthInfo}\n\n请仔细观察面部五官、三停比例、面型、气色等特征，从以下维度进行全面解读。\n\n以 JSON 格式返回（不要包含 markdown 代码块标记）：\n{"score":75,"zonglun":"面相总论，综合评价面部格局与气质，200字左右","santing":"三停分析（上停额头-少年运/中停鼻梁-中年运/下停下巴-晚年运），200字左右","wuguan":"五官详解（眉眼鼻口耳），逐一分析形态特征与含义，300字左右","ratings":{"tianting":{"score":8,"desc":"天庭饱满"},"meiyan":{"score":7,"desc":"眉清目秀"},"bixiang":{"score":6,"desc":"鼻梁端正"},"kouxiang":{"score":7,"desc":"口型方正"},"dige":{"score":6,"desc":"地阁圆润"}},"xingge":"性格分析，从面相特征推断性格特质，200字左右","shiye":"事业运势，结合面相格局分析事业方向，200字左右","caiyun":"财运分析，结合鼻相（财帛宫）等分析，150字左右","ganqing":"感情分析，结合眼相、口相等分析，150字左右","jiankang":"健康提示，从气色与五官状态分析，100字左右","jianyi":["改善建议1","改善建议2","改善建议3"]}\n\n注意：ratings 中每个面部区域的 score 为1-10分（10分最优），desc 为4个字的简短描述（如"天庭饱满"、"眉清目秀"、"鼻梁挺拔"、"口型端正"、"地阁方圆"等）。请根据照片中实际面部特征客观评分。`;
        return {
          system: FACE_SYSTEM_PROMPT,
          user,
          maxTokens: 4000,
          timeout: 120000,
          temperature: 0.7,
        };
      }
      case 'palm': {
        const handInfo = data.hand ? `\n手部：${data.hand}` : '';
        const genderInfo =
          data.gender && data.gender !== '未知' ? `\n性别：${data.gender}` : '';
        const birthInfo = data.birthYear
          ? `\n出生年份：${data.birthYear}年（${new Date().getFullYear() - data.birthYear}岁左右）`
          : '';
        const user = `请根据照片中的手掌特征进行手相分析：${handInfo}${genderInfo}${birthInfo}\n\n请仔细观察掌纹三大主线（生命线、智慧线、感情线）及其他辅助纹路，从以下维度进行全面解读。\n\n以 JSON 格式返回（不要包含 markdown 代码块标记）：\n{"score":75,"zonglun":"手相总论，综合评价掌纹格局，200字左右","shengmingxian":"生命线分析（长度、深浅、走向），200字左右","zhihuixian":"智慧线分析（长度、深浅、走向），200字左右","ganqingxian":"感情线分析（长度、深浅、走向），200字左右","shiyexian":"事业线分析（有无、清晰度、走向），150字左右","ratings":{"shengmingxian":{"score":8,"desc":"深长清晰"},"zhihuixian":{"score":7,"desc":"平直有力"},"ganqingxian":{"score":6,"desc":"弧度适中"},"shiyexian":{"score":7,"desc":"清晰上扬"}},"xingge":"性格分析，从掌纹特征推断性格特质，200字左右","caiyun":"财运分析，结合财运线等分析，150字左右","ganqing":"感情婚姻，结合感情线、婚姻线分析，150字左右","jiankang":"健康提示，从生命线与掌色分析，100字左右","jianyi":["改善建议1","改善建议2","改善建议3"]}\n\n注意：ratings 中每条主线的 score 为1-10分（10分最优），desc 为4个字的简短描述（如"深长清晰"、"平直有力"、"弧度适中"等）。请根据照片中实际掌纹特征客观评分。`;
        return {
          system: PALM_SYSTEM_PROMPT,
          user,
          maxTokens: 4000,
          timeout: 120000,
          temperature: 0.7,
        };
      }
      case 'tongue': {
        const genderInfo =
          data.gender && data.gender !== '未知' ? `\n性别：${data.gender}` : '';
        const birthInfo = data.birthYear
          ? `\n出生年份：${data.birthYear}年（${new Date().getFullYear() - data.birthYear}岁左右）`
          : '';
        const user = `请根据照片中的舌象特征进行中医舌诊分析：${genderInfo}${birthInfo}\n\n请仔细观察舌质（颜色、形态）、舌苔（厚薄、颜色、润燥）、舌形（胖瘦、齿痕、裂纹）等特征，从以下维度进行全面解读。\n\n以 JSON 格式返回（不要包含 markdown 代码块标记）：\n{"score":75,"zonglun":"舌诊总论，综合评价舌象与健康状况，200字左右","shezhi":"舌质分析（颜色如淡红/淡白/红绛/紫暗，形态特征），200字左右","shetai":"舌苔分析（颜色如白/黄/灰黑，厚薄程度，润燥状态），200字左右","shexing":"舌形分析（胖瘦、齿痕、裂纹、点刺等），200字左右","ratings":{"shezhi":{"score":7,"desc":"淡红润泽"},"shetai":{"score":6,"desc":"薄白微腻"},"shexing":{"score":8,"desc":"大小适中"},"shetai_houbo":{"score":7,"desc":"薄苔适度"},"shetai_runzao":{"score":6,"desc":"润泽有津"}},"jiankang":"健康状况评估，从舌象反映的脏腑气血状态分析，250字左右","tizhipanduan":"体质判断（如气虚、阳虚、阴虚、痰湿、湿热、血瘀等），200字左右","yinshi":"饮食建议，根据舌象给出宜忌食物，200字左右","yangsheng":"养生建议，包括作息、运动、情志调理等，200字左右","jianyi":["调理建议1","调理建议2","调理建议3","调理建议4"]}\n\n注意：ratings 中每个舌相特征的 score 为1-10分（10分最优，表示健康），desc 为4个字的简短描述（如"淡红润泽"、"薄白均匀"、"大小适中"、"薄苔适度"、"润泽有津"等）。请根据照片中实际舌象特征客观评分。`;
        return {
          system: TONGUE_SYSTEM_PROMPT,
          user,
          maxTokens: 4000,
          timeout: 120000,
          temperature: 0.7,
        };
      }
      case 'fengshui': {
        const dirInfo =
          data.direction && data.direction !== '未知'
            ? `\n房屋朝向：${data.direction}`
            : '';
        const typeInfo =
          data.houseType && data.houseType !== '未知'
            ? `\n户型描述：${data.houseType}`
            : '';
        const genderInfo =
          data.ownerGender && data.ownerGender !== '未知'
            ? `\n户主性别：${data.ownerGender}`
            : '';
        const birthInfo = data.ownerBirthYear
          ? `\n户主出生年份：${data.ownerBirthYear}年`
          : '';
        const user = `请根据照片中的房屋/户型图进行风水分析：\n${dirInfo}${typeInfo}${genderInfo}${birthInfo}\n\n请仔细观察房屋布局、朝向、各功能区方位，依据《八宅明镜》《阳宅三要》等风水经典，从以下维度进行全面分析。\n\n以 JSON 格式返回（不要包含 markdown 代码块标记）：\n{"score":75,"zonglun":"风水总论，综合评价房屋整体风水格局，分析宅命配合情况，200字左右","bazhai":"八宅分析，判断东四宅/西四宅，结合户主命卦分析宅命是否相配，200字左右","damen":"大门方位分析，判断大门所在方位吉凶，纳气情况，200字左右","zhuwo":"主卧方位分析，判断主卧是否在吉位，床位朝向建议，200字左右","chufang":"厨房方位分析，灶位朝向与五行关系，150字左右","ratings":{"damen":{"score":7,"desc":"纳气平稳"},"zhuwo":{"score":8,"desc":"位居吉方"},"chufang":{"score":6,"desc":"灶位尚可"},"keting":{"score":7,"desc":"明堂开阔"},"weishengjian":{"score":5,"desc":"需注意"}},"caiyun":"财位分析，明财位/暗财位所在方位及催旺建议，200字左右","shaye":"煞气分析，是否存在路冲、角煞、反弓等不利因素及化解方法，200字左右","buju":"布局优化建议，具体的家具摆放、颜色搭配、风水物品建议，300字左右","jianyi":["风水改善建议1","风水改善建议2","风水改善建议3","风水改善建议4"]}\n\n注意：ratings 中每个区域的 score 为1-10分（10分最优），desc 为4-6个字的简短描述。请根据照片中实际布局与方位客观评分。`;
        return {
          system: FENGSHUI_SYSTEM_PROMPT,
          user,
          maxTokens: 4000,
          timeout: 120000,
          temperature: 0.7,
        };
      }
      case 'chouqian': {
        const sign = data;
        const CHOUQIAN_SYSTEM_PROMPT = `你是「易知先生」，一位精通观音灵签等传统签文解读的大师。你深谙签文诗意、典故寓意，擅长结合求签者的问题给出贴合实际的解读与建议。

你的风格：
- 以签文为本，结合诗意、典故、吉凶等级进行分析
- 语言温润有力，既有传统文化底蕴，又贴近现代生活
- 注重实用指导，给出可操作的建议
- 不做绝对论断，多用"签文显示"、"宜"、"需留意"

你的原则：
- 尊重签文原意，不过度解读
- 结合求签者的具体问题给出针对性建议
- 给出积极向上的人生指引
- 既看吉凶，更重在如何趋吉避凶`;

        const user = `请为以下抽签结果进行解读：

【签号】第${sign.signNumber}签
【签文标题】${sign.title || ''}
【吉凶等级】${sign.fortune || ''}

【签诗】
${sign.poem || ''}

【典故】
${sign.story || ''}

【传统解签】
${sign.interpretation || ''}

【签意】
${sign.meaning || ''}

【建议】
${sign.advice || ''}

请结合签文内容，用现代语言为求签者进行深入解读。

以 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "zonglun": "签文总论，综合解读此签的核心含义与吉凶指向，200字左右",
  "shiqian": "诗签解读，逐句解析签诗的意境与寓意，250字左右",
  "diangu": "典故启示，解读典故与当下的关联，150字左右",
  "shiye": "事业运势，结合签文分析事业发展，150字左右",
  "caiyun": "财运分析，结合签文分析财运走向，150字左右",
  "ganqing": "感情婚姻，结合签文分析感情状况，150字左右",
  "jiankang": "健康平安，结合签文给出健康提示，100字左右",
  "jianyi": ["具体建议1", "具体建议2", "具体建议3", "具体建议4"]
}`;
        return {
          system: CHOUQIAN_SYSTEM_PROMPT,
          user,
          maxTokens: 3000,
          timeout: 60000,
          temperature: 0.7,
        };
      }
      case 'dream': {
        const dream = extraParams?.dream || '';
        const user = `请为以下梦境进行详细解析：

【梦境描述】
${dream}

请结合传统周公解梦和现代心理学，深入分析梦境的象征意义。

以 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "zonglun": "梦境总论，综合判断梦境的整体寓意和吉凶，200字左右",
  "yuansu": "梦境元素分析，详细解读梦中出现的关键元素（人物、动物、物品、场景等）及其象征意义，250字左右",
  "qingxu": "情绪与心理状态，分析梦境反映的潜意识情绪和心理需求，150字左右",
  "caiyun": "财运解析，从梦境元素判断近期财运走势，150字左右",
  "shiye": "事业解析，分析梦境对事业发展的暗示，150字左右",
  "ganqing": "感情解析，解读梦境中的感情信息，150字左右",
  "jiankang": "健康解析，从梦境判断身心健康状况，100字左右",
  "renji": "人际关系，分析梦境中的人际互动信息，100字左右",
  "jixiong": "吉凶判断，综合评估梦境的吉凶倾向和需要注意的事项，150字左右",
  "jianyi": ["具体建议1", "具体建议2", "具体建议3", "具体建议4"]
}`;
        return {
          system: DREAM_SYSTEM_PROMPT,
          user,
          maxTokens: 4000,
          timeout: 60000,
          temperature: 0.7,
        };
      }
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }

  /** 流式 AI 解读，返回 token 异步生成器 */
  async *streamInterpretation(
    system: string,
    user: string,
    maxTokens: number,
    timeout: number,
    temperature: number,
  ): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create(
      {
        model: this.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true,
      },
      { timeout },
    );

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }

  /** 流式 AI 解读（视觉模型），用于面相分析等需要图片的场景 */
  async *streamVisionInterpretation(
    system: string,
    userText: string,
    imageBase64: string,
    maxTokens: number,
    timeout: number,
    temperature: number,
  ): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create(
      {
        model: this.visionModel,
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: [
              { type: 'text', text: userText },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true,
      },
      { timeout },
    );

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }

  /** 获取指定类型的 fallback 结果 */
  getFallback(type: string, data: any): any {
    switch (type) {
      case 'bazi':
        return this.fallbackResult(data);
      case 'meihua':
        return this.meihuaFallback(data);
      case 'ziwei':
        return this.ziweiFallback(data);
      case 'qimen':
        return this.qimenFallback(data);
      case 'liuyao':
        return this.liuyaoFallback(data);
      case 'yijing':
        return this.yijingFallback(data);
      case 'xiaoliuren':
        return this.xiaoliurenFallback(data);
      case 'xunwu':
        return this.xunwuFallback(data);
      case 'zeji':
        return this.zejiFallback(data);
      case 'naming':
        return this.namingFallback(data);
      case 'namingCheck':
        return this.namingCheckFallback(data);
      case 'hehun':
        return this.hehunFallback(data);
      case 'shengyi':
        return this.shengyiFallback(data);
      case 'face':
        return this.faceFallback();
      case 'palm':
        return this.palmFallback();
      case 'fengshui':
        return this.fengshuiFallback();
      case 'chouqian':
        return this.chouqianFallback(data);
      case 'dream':
        return this.dreamFallback(data);
      default:
        return {};
    }
  }

  private chouqianFallback(data: any): any {
    return {
      zonglun: `第${data.signNumber}签，${data.fortune || ''}。${data.title || ''}`,
      shiqian: data.poem || '签诗待 AI 详细解读。',
      diangu: data.story || '典故待 AI 详细解读。',
      shiye: '事业运势待 AI 详细分析。',
      caiyun: '财运走势待 AI 详细分析。',
      ganqing: '感情运势待 AI 详细分析。',
      jiankang: '健康平安待 AI 详细分析。',
      jianyi: ['虔诚祈福', '顺势而为', '积善行德', '耐心等待'],
    };
  }

  private dreamFallback(data: any): DreamAiResult {
    return {
      zonglun: '梦境总论待 AI 详细分析。',
      yuansu: '梦境元素分析待 AI 详细分析。',
      qingxu: '情绪与心理状态待 AI 详细分析。',
      caiyun: '财运解析待 AI 详细分析。',
      shiye: '事业解析待 AI 详细分析。',
      ganqing: '感情解析待 AI 详细分析。',
      jiankang: '健康解析待 AI 详细分析。',
      renji: '人际关系待 AI 详细分析。',
      jixiong: '吉凶判断待 AI 详细分析。',
      jianyi: ['保持积极心态', '关注内心需求', '顺应自然规律', '把握当下机遇'],
    };
  }

  private faceFallback(): FaceAiResult {
    return {
      score: 70,
      zonglun: '面相总论待 AI 视觉分析。',
      santing: '三停分析待 AI 视觉分析。',
      wuguan: '五官详解待 AI 视觉分析。',
      ratings: {
        tianting: { score: 7, desc: '待分析' },
        meiyan: { score: 7, desc: '待分析' },
        bixiang: { score: 7, desc: '待分析' },
        kouxiang: { score: 7, desc: '待分析' },
        dige: { score: 7, desc: '待分析' },
      },
      xingge: '性格分析待 AI 视觉分析。',
      shiye: '事业运势待 AI 视觉分析。',
      caiyun: '财运分析待 AI 视觉分析。',
      ganqing: '感情分析待 AI 视觉分析。',
      jiankang: '健康提示待 AI 视觉分析。',
      jianyi: ['保持乐观心态', '注重面部养护', '广结善缘'],
    };
  }

  private palmFallback(): PalmAiResult {
    return {
      score: 70,
      zonglun: '手相总论待 AI 视觉分析。',
      shengmingxian: '生命线分析待 AI 视觉分析。',
      zhihuixian: '智慧线分析待 AI 视觉分析。',
      ganqingxian: '感情线分析待 AI 视觉分析。',
      shiyexian: '事业线分析待 AI 视觉分析。',
      ratings: {
        shengmingxian: { score: 7, desc: '待分析' },
        zhihuixian: { score: 7, desc: '待分析' },
        ganqingxian: { score: 7, desc: '待分析' },
        shiyexian: { score: 7, desc: '待分析' },
      },
      xingge: '性格分析待 AI 视觉分析。',
      caiyun: '财运分析待 AI 视觉分析。',
      ganqing: '感情分析待 AI 视觉分析。',
      jiankang: '健康提示待 AI 视觉分析。',
      jianyi: ['保持积极心态', '勤劳致富', '广结善缘'],
    };
  }

  private fengshuiFallback(): FengshuiAiResult {
    return {
      score: 70,
      zonglun: '风水总论待 AI 视觉分析。',
      bazhai: '八宅分析待 AI 视觉分析。',
      damen: '大门方位待 AI 视觉分析。',
      zhuwo: '主卧方位待 AI 视觉分析。',
      chufang: '厨房方位待 AI 视觉分析。',
      ratings: {
        damen: { score: 7, desc: '待分析' },
        zhuwo: { score: 7, desc: '待分析' },
        chufang: { score: 7, desc: '待分析' },
        keting: { score: 7, desc: '待分析' },
        weishengjian: { score: 7, desc: '待分析' },
      },
      caiyun: '财位分析待 AI 视觉分析。',
      shaye: '煞气分析待 AI 视觉分析。',
      buju: '布局建议待 AI 视觉分析。',
      jianyi: [
        '保持室内整洁通风',
        '注意大门纳气方向',
        '合理摆放家具',
        '适当添加绿植',
      ],
    };
  }
}
