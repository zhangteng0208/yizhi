// AI 解读深度等级
export enum AiDepth {
  SIMPLE = 'simple',     // 简明：100-150字总结
  NORMAL = 'normal',     // 标准：300-500字详细分析
  PROFESSIONAL = 'pro',  // 专业：800-1200字深度解读
}

// 深度等级对应的字数要求
const DEPTH_CONSTRAINTS = {
  simple: {
    zonglun: '100-150字',
    sections: '50-80字',
    jianyi: '3条，每条20字以内',
  },
  normal: {
    zonglun: '150-200字',
    sections: '80-120字',
    jianyi: '5条，每条30字以内',
  },
  pro: {
    zonglun: '200-300字',
    sections: '150-250字',
    jianyi: '8条，每条50字以内',
    yanzheng: '必须包含可验证的过往事件分析',
  },
};
