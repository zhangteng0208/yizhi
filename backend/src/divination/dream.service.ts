import { Injectable, Logger } from '@nestjs/common';

/**
 * 周公解梦服务
 *
 * 根据用户输入的梦境内容，匹配梦兆词典，解析梦境代表的意义
 */

// 梦兆词典：关键词 → 解释列表
const DREAM_DICTIONARY: Record<
  string,
  { meaning: string; category: string; isGood: boolean }[]
> = {
  // 动物类
  蛇: [
    { meaning: '代表生财，财源广进', category: '财运', isGood: true },
    { meaning: '象征智慧与直觉', category: '事业', isGood: true },
    {
      meaning: '若被蛇追，预示近期有小人作祟',
      category: '人际',
      isGood: false,
    },
    { meaning: '梦见蛇咬人，需注意身体健康', category: '健康', isGood: false },
  ],
  龙: [
    { meaning: '飞黄腾达，事业有大发展', category: '事业', isGood: true },
    { meaning: '得贵子或升职加薪', category: '财运', isGood: true },
    { meaning: '龙吸水，财运亨通', category: '财运', isGood: true },
  ],
  老虎: [
    { meaning: '权力与地位的象征', category: '事业', isGood: true },
    { meaning: '若被虎追，预示有危险或阻力', category: '安全', isGood: false },
    { meaning: '骑虎得权，贵人多助', category: '事业', isGood: true },
  ],
  猫: [
    { meaning: '象征财运，猫来财', category: '财运', isGood: true },
    { meaning: '若猫挠人，需防小人', category: '人际', isGood: false },
    { meaning: '黑猫预示有神秘力量相助', category: '事业', isGood: true },
  ],
  狗: [
    { meaning: '忠诚之象，预示有贵人相助', category: '人际', isGood: true },
    { meaning: '狗叫财到，财运将至', category: '财运', isGood: true },
    { meaning: '若被狗咬，需防身边小人', category: '人际', isGood: false },
  ],
  鸟: [
    { meaning: '自由与希望的象征', category: '事业', isGood: true },
    { meaning: '鸟飞入怀，预示得子或升迁', category: '事业', isGood: true },
    { meaning: '乌鸦报丧，谨防不幸', category: '健康', isGood: false },
  ],
  鱼: [
    { meaning: '年年有余，财运旺盛', category: '财运', isGood: true },
    { meaning: '鱼跃龙门，功成名就', category: '事业', isGood: true },
    { meaning: '吃鱼象征口福与富足', category: '生活', isGood: true },
  ],
  马: [
    { meaning: '马到成功，事业顺利', category: '事业', isGood: true },
    { meaning: '骑马得财，贵人相助', category: '财运', isGood: true },
  ],
  猪: [
    { meaning: '福气满堂，生活富足', category: '财运', isGood: true },
    { meaning: '猪拱门，财源广进', category: '财运', isGood: true },
  ],
  鸡: [
    { meaning: '鸡鸣起，勤奋致富', category: '事业', isGood: true },
    { meaning: '雄鸡一唱天下白，困境将解', category: '事业', isGood: true },
  ],
  兔子: [
    { meaning: '月兔送财，财运亨通', category: '财运', isGood: true },
    { meaning: '兔子跑财来，意外之财', category: '财运', isGood: true },
  ],
  蝙蝠: [
    { meaning: '福到眼前，吉祥如意', category: '财运', isGood: true },
    { meaning: '蝙蝠入宅，贵人临门', category: '人际', isGood: true },
  ],
  老鼠: [
    { meaning: '鼠来财，财运将至', category: '财运', isGood: true },
    { meaning: '鼠咬财，耗财之兆', category: '财运', isGood: false },
  ],

  // 人物类
  父母: [
    { meaning: '梦见父母，健康长寿', category: '健康', isGood: true },
    { meaning: '父母去世，预示遗产或独立', category: '事业', isGood: false },
  ],
  子女: [
    { meaning: '子女成才，家业兴旺', category: '事业', isGood: true },
    { meaning: '儿女绕膝，天伦之乐', category: '家庭', isGood: true },
  ],
  朋友: [
    { meaning: '故友重逢，人脉拓展', category: '人际', isGood: true },
    { meaning: '朋友帮忙，贵人相助', category: '人际', isGood: true },
    { meaning: '朋友背叛，需防小人', category: '人际', isGood: false },
  ],
  敌人: [
    { meaning: '战胜敌人，困境反转', category: '事业', isGood: true },
    { meaning: '被敌追赶，压力增大', category: '事业', isGood: false },
  ],
  医生: [{ meaning: '医者到来，病灾将愈', category: '健康', isGood: true }],
  菩萨: [
    { meaning: '菩萨显灵，祈福许愿', category: '事业', isGood: true },
    { meaning: '佛光普照，晦气尽除', category: '事业', isGood: true },
  ],
  鬼: [
    { meaning: '鬼压床，压力大或体虚', category: '健康', isGood: false },
    { meaning: '鬼怪散去，灾祸消除', category: '事业', isGood: true },
  ],

  // 自然类
  水: [
    { meaning: '水主财，财运亨通', category: '财运', isGood: true },
    { meaning: '流水不断，财源滚滚', category: '财运', isGood: true },
    { meaning: '洪水泛滥，谨防破财', category: '财运', isGood: false },
  ],
  火: [
    { meaning: '火旺事业兴，蒸蒸日上', category: '事业', isGood: true },
    { meaning: '火光冲天，财运旺盛', category: '财运', isGood: true },
    { meaning: '火灾破财，注意安全', category: '财运', isGood: false },
  ],
  山: [
    { meaning: '山高人为峰，事业登顶', category: '事业', isGood: true },
    { meaning: '登山得贵，地位提升', category: '事业', isGood: true },
  ],
  海: [
    { meaning: '海阔天空，志在千里', category: '事业', isGood: true },
    { meaning: '海水清澈，财运平稳', category: '财运', isGood: true },
  ],
  雨: [
    { meaning: '雨露滋润，万物生长', category: '财运', isGood: true },
    { meaning: '雨过天晴，困境将解', category: '事业', isGood: true },
  ],
  雪: [
    { meaning: '雪兆丰年，财运将至', category: '财运', isGood: true },
    { meaning: '雪花飘飘，好事将近', category: '事业', isGood: true },
  ],
  风: [
    { meaning: '风生水起，财运旺盛', category: '财运', isGood: true },
    { meaning: '顺风得利，事半功倍', category: '事业', isGood: true },
  ],
  雷: [{ meaning: '雷声大作，贵人将至', category: '人际', isGood: true }],
  太阳: [
    { meaning: '旭日东升，鸿运当头', category: '事业', isGood: true },
    { meaning: '日光普照，财运亨通', category: '财运', isGood: true },
  ],
  月亮: [
    { meaning: '月亮圆满，团圆和睦', category: '家庭', isGood: true },
    { meaning: '月明星稀，贵人相助', category: '人际', isGood: true },
  ],
  星星: [
    { meaning: '星耀夜空，贵人指引', category: '事业', isGood: true },
    { meaning: '流星划过，愿望将成', category: '事业', isGood: true },
  ],

  // 建筑类
  房子: [
    { meaning: '新居落成，财运将至', category: '财运', isGood: true },
    { meaning: '房屋坚固，家业稳固', category: '家庭', isGood: true },
    { meaning: '房子漏水，财库有损', category: '财运', isGood: false },
  ],
  门: [
    { meaning: '开门大吉，财运亨通', category: '财运', isGood: true },
    { meaning: '门庭若市，人脉旺盛', category: '人际', isGood: true },
  ],
  窗户: [{ meaning: '窗户明亮，前途光明', category: '事业', isGood: true }],
  楼梯: [
    { meaning: '步步高升，职位晋升', category: '事业', isGood: true },
    { meaning: '楼梯平坦，财运平稳', category: '财运', isGood: true },
  ],
  电梯: [
    { meaning: '电梯上升，财运上升', category: '财运', isGood: true },
    { meaning: '电梯下降，谨防破财', category: '财运', isGood: false },
  ],
  寺庙: [
    { meaning: '寺庙祈福，愿望将成', category: '事业', isGood: true },
    { meaning: '佛祖保佑，逢凶化吉', category: '安全', isGood: true },
  ],
  桥: [
    { meaning: '过桥得路，机遇将至', category: '事业', isGood: true },
    { meaning: '桥通财通，财运亨通', category: '财运', isGood: true },
  ],

  // 物品类
  钱: [
    { meaning: '财源广进，富贵盈门', category: '财运', isGood: true },
    { meaning: '金钱满地，财大气粗', category: '财运', isGood: true },
    { meaning: '钱丢失，谨防破财', category: '财运', isGood: false },
  ],
  珠宝: [
    { meaning: '珠宝满箱，富贵荣华', category: '财运', isGood: true },
    { meaning: '玉佩保身，趋吉避凶', category: '安全', isGood: true },
  ],
  刀剑: [
    { meaning: '剑锋出鞘，权力在握', category: '事业', isGood: true },
    { meaning: '刀光剑影，竞争激烈', category: '事业', isGood: false },
  ],
  书: [
    { meaning: '学业进步，金榜题名', category: '事业', isGood: true },
    { meaning: '读书明智，智慧增长', category: '事业', isGood: true },
  ],
  车: [
    { meaning: '车行万里，财路亨通', category: '财运', isGood: true },
    { meaning: '乘车远行，机遇来临', category: '事业', isGood: true },
  ],
  手机: [{ meaning: '手机来讯，消息将至', category: '人际', isGood: true }],
  电脑: [{ meaning: '电脑升级，事业发展', category: '事业', isGood: true }],
  棺材: [
    { meaning: '棺材升官，职权提升', category: '事业', isGood: true },
    { meaning: '见棺发财，贵人相助', category: '财运', isGood: true },
  ],

  // 身体类
  牙: [
    { meaning: '牙齿坚固，健康长寿', category: '健康', isGood: true },
    { meaning: '牙掉落，亲人有损', category: '家庭', isGood: false },
  ],
  血: [
    { meaning: '血主财，财运旺盛', category: '财运', isGood: true },
    { meaning: '见血破财，谨防损失', category: '财运', isGood: false },
  ],
  头: [{ meaning: '头脑清醒，智慧增长', category: '事业', isGood: true }],
  手: [
    { meaning: '手相好，财运旺', category: '财运', isGood: true },
    { meaning: '手受伤，谨防小人', category: '人际', isGood: false },
  ],
  脚: [
    { meaning: '脚步稳健，步步高升', category: '事业', isGood: true },
    { meaning: '脚受伤，前进受阻', category: '事业', isGood: false },
  ],
  眼睛: [{ meaning: '眼明心亮，看清局势', category: '事业', isGood: true }],

  // 食物类
  吃饭: [
    { meaning: '家宴团聚，财运亨通', category: '财运', isGood: true },
    { meaning: '吃饱喝足，富足安康', category: '财运', isGood: true },
  ],
  酒: [
    { meaning: '美酒佳肴，富贵盈门', category: '财运', isGood: true },
    { meaning: '酒逢知己，人脉旺盛', category: '人际', isGood: true },
  ],
  肉: [{ meaning: '吃肉有力，身体健康', category: '健康', isGood: true }],
  水果: [{ meaning: '水果丰硕，财运旺盛', category: '财运', isGood: true }],

  // 行为类
  结婚: [
    { meaning: '结婚喜庆，姻缘将至', category: '家庭', isGood: true },
    { meaning: '已婚梦婚，财运将至', category: '财运', isGood: true },
  ],
  怀孕: [
    { meaning: '怀孕添丁，家族兴旺', category: '家庭', isGood: true },
    { meaning: '梦中有喜，财运到来', category: '财运', isGood: true },
  ],
  死亡: [
    { meaning: '置之死地而后生，运势反转', category: '事业', isGood: true },
  ],
  飞: [
    { meaning: '飞翔高空，志在千里', category: '事业', isGood: true },
    { meaning: '飞黄腾达，功成名就', category: '事业', isGood: true },
  ],
  游泳: [{ meaning: '游泳顺利，财运亨通', category: '财运', isGood: true }],
  跑步: [{ meaning: '跑步前进，事业发展', category: '事业', isGood: true }],
  考试: [
    { meaning: '考试通过，金榜题名', category: '事业', isGood: true },
    { meaning: '考试失败，压力增大', category: '事业', isGood: false },
  ],
  旅行: [{ meaning: '旅行远行，机遇来临', category: '事业', isGood: true }],
  搬家: [{ meaning: '乔迁之喜，财运将至', category: '财运', isGood: true }],
  工作: [{ meaning: '工作顺利，职位晋升', category: '事业', isGood: true }],
  理发: [{ meaning: '理发整洁，形象提升', category: '事业', isGood: true }],
  洗澡: [{ meaning: '洗澡除晦，运势反转', category: '事业', isGood: true }],
  睡觉: [{ meaning: '安眠无梦，修养身心', category: '健康', isGood: true }],
  唱歌: [{ meaning: '歌声嘹亮，喜事临门', category: '事业', isGood: true }],
  跳舞: [{ meaning: '舞步轻盈，财运亨通', category: '财运', isGood: true }],
  购物: [{ meaning: '买到便宜，省钱有道', category: '财运', isGood: true }],
  逃跑: [{ meaning: '逃跑成功，躲避灾祸', category: '安全', isGood: true }],
  哭泣: [{ meaning: '哭泣释放，压力解除', category: '健康', isGood: true }],
  笑: [{ meaning: '笑声不断，喜事连连', category: '事业', isGood: true }],
  做饭: [{ meaning: '做饭持家，生活安稳', category: '家庭', isGood: true }],
  钓鱼: [{ meaning: '钓鱼收获，财运到来', category: '财运', isGood: true }],
  开车: [{ meaning: '开车顺风，财运亨通', category: '财运', isGood: true }],
  坐飞机: [{ meaning: '飞机起飞，职位晋升', category: '事业', isGood: true }],
  坐船: [{ meaning: '船行水中，财运平稳', category: '财运', isGood: true }],
  爬山: [{ meaning: '爬山登顶，志在千里', category: '事业', isGood: true }],
  打电话: [{ meaning: '电话畅通，消息将至', category: '人际', isGood: true }],

  // 颜色类
  红色: [{ meaning: '红红火火，财运旺盛', category: '财运', isGood: true }],
  白色: [{ meaning: '白色纯洁，平安吉祥', category: '健康', isGood: true }],
  黑色: [{ meaning: '黑色神秘，智慧增长', category: '事业', isGood: true }],
  金色: [{ meaning: '金色辉煌，财运亨通', category: '财运', isGood: true }],
  绿色: [{ meaning: '绿草如茵，生机盎然', category: '健康', isGood: true }],
  蓝色: [{ meaning: '蓝天白云，前程似锦', category: '事业', isGood: true }],

  // 其他
  厕所: [{ meaning: '厕所干净，晦气消除', category: '事业', isGood: true }],
  监狱: [{ meaning: '监狱释放，困境解除', category: '事业', isGood: true }],
  学校: [{ meaning: '学校学习，技能提升', category: '事业', isGood: true }],
  医院: [{ meaning: '医院康复，身体健康', category: '健康', isGood: true }],
  银行: [{ meaning: '银行存钱，积蓄增加', category: '财运', isGood: true }],
};

export interface DreamResult {
  /** 用户输入的梦境内容 */
  dream: string;
  /** 解析出的关键词 */
  keywords: string[];
  /** 解析结果列表 */
  interpretations: {
    keyword: string;
    meaning: string;
    category: string;
    isGood: boolean;
  }[];
  /** 总体吉凶 */
  overall: {
    isGood: boolean;
    summary: string;
  };
}

@Injectable()
export class DreamService {
  private readonly logger = new Logger(DreamService.name);

  /**
   * 解梦
   * @param dream 用户输入的梦境描述
   */
  calculate(dream: string): DreamResult {
    const keywords = this.extractKeywords(dream);
    const interpretations: DreamResult['interpretations'] = [];

    // 匹配关键词
    for (const keyword of keywords) {
      const meanings = DREAM_DICTIONARY[keyword];
      if (meanings) {
        for (const m of meanings) {
          interpretations.push({
            keyword,
            meaning: m.meaning,
            category: m.category,
            isGood: m.isGood,
          });
        }
      }
    }

    // 如果没有匹配到任何关键词，返回通用解释
    if (interpretations.length === 0) {
      return {
        dream,
        keywords: [],
        interpretations: [],
        overall: {
          isGood: true,
          summary:
            '此梦境较为独特，需结合更多细节分析。梦境往往反映潜意识的期待与担忧，建议回顾近期生活状态，审视梦境中的情感色彩。',
        },
      };
    }

    // 计算总体吉凶
    const goodCount = interpretations.filter((i) => i.isGood).length;
    const badCount = interpretations.filter((i) => !i.isGood).length;
    const isGood = goodCount >= badCount;

    // 统计各类别
    const categories = new Map<string, number>();
    for (const i of interpretations) {
      categories.set(i.category, (categories.get(i.category) || 0) + 1);
    }

    let summary = '';
    if (isGood) {
      if (goodCount >= 5) {
        summary = `大吉之梦！梦中出现${keywords.join('、')}，主财运亨通、贵人相助，近期有望收获意外惊喜。建议把握机遇，积极行动。`;
      } else {
        summary = `吉梦。梦中元素${keywords.join('、')}暗示近期运势平稳，宜脚踏实地，按计划行事则诸事顺遂。`;
      }
    } else {
      if (badCount >= 3) {
        summary = `此梦提醒需多加留意。梦中出现的${keywords.join('、')}警示近期需谨慎行事，防微杜渐，避免口舌是非和破财风险。`;
      } else {
        summary =
          '梦境略有波折但不必过于担忧。保持积极心态，谨慎应对即可化解。';
      }
    }

    return {
      dream,
      keywords,
      interpretations,
      overall: {
        isGood,
        summary,
      },
    };
  }

  /**
   * 从梦境描述中提取关键词
   */
  private extractKeywords(dream: string): string[] {
    const found: string[] = [];
    const dreamLower = dream.toLowerCase();

    // 按关键词长度降序排序，优先匹配更长的词
    const sortedKeywords = Object.keys(DREAM_DICTIONARY).sort(
      (a, b) => b.length - a.length,
    );

    for (const keyword of sortedKeywords) {
      if (dream.includes(keyword) && !found.includes(keyword)) {
        found.push(keyword);
      }
    }

    // 限制返回的关键词数量
    return found.slice(0, 5);
  }
}
