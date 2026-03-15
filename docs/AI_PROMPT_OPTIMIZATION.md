# AI 解读提示词优化方案

## 📋 优化总结

### 核心改进

**1. 统一风格定位**
- ✅ 专业但易懂
- ✅ 温和而坚定
- ✅ 既准确又实用

**2. 增加深度等级**
- `simple`: 简明模式（100-150字总结）
- `normal`: 标准模式（300-500字详细分析）
- `pro`: 专业模式（800-1200字深度解读 + 古籍引用 + 过往验证）

**3. 结构化输出约束**
- 严格 JSON 格式
- 明确字数要求
- 统一字段命名

**4. 增加用户问题上下文**
- 充分利用用户的具体问题
- 结合命理数据进行针对性分析

**5. 增加验证机制**
- 专业模式必须包含过往验证
- 要求分析 2023-2025 年的重大事件

## 🎯 实施步骤

### 第一步：创建提示词模板文件

已创建：
- ✅ `backend/src/divination/prompts/bazi.prompt.ts` - 八字
- ✅ `backend/src/divination/prompts/liuyao.prompt.ts` - 六爻
- ✅ `backend/src/divination/prompts/ziwei.prompt.ts` - 紫微斗数
- ⏳ 其他占卜类型（梅花易数、奇门遁甲、小六壬等）

### 第二步：修改 AI Service

需要修改 `backend/src/divination/ai.service.ts`：

1. **引入深度等级**
```typescript
import { AiDepth } from './ai-depth.config.js';
import { BAZI_PROMPT_TEMPLATE } from './prompts/bazi.prompt.js';
import { LIUYAO_PROMPT_TEMPLATE } from './prompts/liuyao.prompt.js';
import { ZIWEI_PROMPT_TEMPLATE } from './prompts/ziwei.prompt.js';
```

2. **修改 getPromptConfig 方法**
```typescript
getPromptConfig(
  type: string,
  data: any,
  extraParams?: { depth?: AiDepth; question?: string }
) {
  const depth = extraParams?.depth || AiDepth.NORMAL;
  const question = extraParams?.question;

  switch (type) {
    case 'bazi':
      return {
        system: BAZI_PROMPT_TEMPLATE.system(depth),
        user: BAZI_PROMPT_TEMPLATE.user(data, question),
        maxTokens: depth === 'pro' ? 3000 : depth === 'normal' ? 2000 : 1000,
      };
    case 'liuyao':
      return {
        system: LIUYAO_PROMPT_TEMPLATE.system(depth),
        user: LIUYAO_PROMPT_TEMPLATE.user(data, question),
        maxTokens: depth === 'pro' ? 2500 : depth === 'normal' ? 1500 : 800,
      };
    // ... 其他类型
  }
}
```

3. **前端增加深度选择**
```typescript
// 前端调用示例
const depth = ref<'simple' | 'normal' | 'pro'>('normal');

const fetchAiResult = async () => {
  const response = await fetch('/api/divination/ai-stream', {
    method: 'POST',
    body: JSON.stringify({
      type: 'bazi',
      data: baziData,
      extraParams: {
        depth: depth.value,
        question: userQuestion.value,
      },
    }),
  });
};
```

### 第三步：前端 UI 优化

在占卜结果页面添加深度选择：

```vue
<van-radio-group v-model="depth">
  <van-radio name="simple">简明解读</van-radio>
  <van-radio name="normal">标准解读</van-radio>
  <van-radio name="pro">专业解读</van-radio>
</van-radio-group>
```

### 第四步：测试验证

1. **测试不同深度的输出**
   - 简明模式：快速判断，适合快速查看
   - 标准模式：详细分析，适合日常使用
   - 专业模式：深度解读，适合深入研究

2. **测试 JSON 格式稳定性**
   - 确保 AI 输出严格符合 JSON 格式
   - 处理解析失败的情况

3. **测试用户问题上下文**
   - 验证 AI 是否针对具体问题给出回答
   - 验证过往事件分析的准确性

## 📊 优化效果预期

### 用户体验提升

**简明模式**：
- 响应速度：快（~5秒）
- Token 消耗：低（~500 tokens）
- 适用场景：快速查看、移动端

**标准模式**：
- 响应速度：中（~10秒）
- Token 消耗：中（~1500 tokens）
- 适用场景：日常使用、详细分析

**专业模式**：
- 响应速度：慢（~20秒）
- Token 消耗：高（~3000 tokens）
- 适用场景：深入研究、专业用户

### 成本优化

- 简明模式可节省 70% 的 API 成本
- 用户可根据需求选择深度，避免浪费
- 缓存机制可进一步降低成本

### 质量提升

- 结构化输出更稳定
- 用户问题上下文更精准
- 过往验证增加可信度

## 🚀 下一步行动

1. **完成其他占卜类型的提示词模板**（梅花易数、奇门遁甲、小六壬等）
2. **修改 AI Service 集成新模板**
3. **前端增加深度选择 UI**
4. **测试验证各个深度的输出质量**
5. **收集用户反馈，持续优化**

## 💡 额外建议

### 1. 增加提示词版本管理

```typescript
export const PROMPT_VERSION = '2.0.0';

export interface PromptTemplate {
  version: string;
  system: (depth: AiDepth) => string;
  user: (data: any, question?: string) => string;
}
```

### 2. 增加 A/B 测试

- 对比新旧提示词的效果
- 收集用户满意度评分
- 根据数据持续优化

### 3. 增加提示词热更新

- 提示词存储在数据库
- 支持在线修改和发布
- 无需重启服务即可生效

### 4. 增加用户反馈机制

```typescript
// 每次 AI 解读后收集反馈
interface AiFeedback {
  recordId: string;
  rating: 1 | 2 | 3 | 4 | 5;  // 1-5星评分
  helpful: boolean;            // 是否有帮助
  accurate: boolean;           // 是否准确
  comment?: string;            // 用户评论
}
```

### 5. 增加提示词效果监控

- 平均响应时间
- Token 消耗统计
- 用户满意度评分
- JSON 解析成功率

---

需要我帮你实现这些优化吗？我可以：
1. 完成其他占卜类型的提示词模板
2. 修改 AI Service 集成新模板
3. 前端增加深度选择 UI
4. 测试验证输出质量
