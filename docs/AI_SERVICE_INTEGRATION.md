# AI Service 集成新提示词 - 实施指南

## 修改步骤

### 1. 修改 ai.service.ts 头部导入

在文件开头添加：

```typescript
import {
  BAZI_PROMPT_TEMPLATE,
  LIUYAO_PROMPT_TEMPLATE,
  ZIWEI_PROMPT_TEMPLATE,
  MEIHUA_PROMPT_TEMPLATE,
  QIMEN_PROMPT_TEMPLATE,
  YIJING_PROMPT_TEMPLATE,
  XIAOLIUREN_PROMPT_TEMPLATE,
  ZEJI_PROMPT_TEMPLATE,
  XUNWU_PROMPT_TEMPLATE,
  HEHUN_PROMPT_TEMPLATE,
  NAMING_PROMPT_TEMPLATE,
} from './prompts/index.js';

// 深度类型
export type AiDepth = 'simple' | 'normal' | 'pro';
```

### 2. 修改 getPromptConfig 方法签名

```typescript
getPromptConfig(
  type: string,
  data: any,
  extraParams?: {
    depth?: AiDepth;
    question?: string;
    [key: string]: any;
  },
): {
  system: string;
  user: string;
  maxTokens: number;
  timeout: number;
  temperature: number;
} {
  const depth = extraParams?.depth || 'normal';
  const question = extraParams?.question;

  switch (type) {
    case 'bazi':
      return {
        system: BAZI_PROMPT_TEMPLATE.system(depth),
        user: BAZI_PROMPT_TEMPLATE.user(data, question),
        maxTokens: depth === 'pro' ? 4000 : depth === 'normal' ? 2500 : 1500,
        timeout: 60000,
        temperature: 0.7,
      };

    case 'liuyao':
      return {
        system: LIUYAO_PROMPT_TEMPLATE.system(depth),
        user: LIUYAO_PROMPT_TEMPLATE.user(data, question || ''),
        maxTokens: depth === 'pro' ? 3000 : depth === 'normal' ? 2000 : 1000,
        timeout: 60000,
        temperature: 0.7,
      };

    case 'ziwei':
      return {
        system: ZIWEI_PROMPT_TEMPLATE.system(depth),
        user: ZIWEI_PROMPT_TEMPLATE.user(data, question),
        maxTokens: depth === 'pro' ? 4000 : depth === 'normal' ? 2500 : 1500,
        timeout: 60000,
        temperature: 0.7,
      };

    case 'meihua':
      return {
        system: MEIHUA_PROMPT_TEMPLATE.system(depth),
        user: MEIHUA_PROMPT_TEMPLATE.user(data, question),
        maxTokens: depth === 'pro' ? 2500 : depth === 'normal' ? 1500 : 800,
        timeout: 60000,
        temperature: 0.7,
      };

    case 'qimen':
      return {
        system: QIMEN_PROMPT_TEMPLATE.system(depth),
        user: QIMEN_PROMPT_TEMPLATE.user(data, question),
        maxTokens: depth === 'pro' ? 3000 : depth === 'normal' ? 2000 : 1000,
        timeout: 60000,
        temperature: 0.7,
      };

    case 'yijing':
      return {
        system: YIJING_PROMPT_TEMPLATE.system(depth),
        user: YIJING_PROMPT_TEMPLATE.user(data, question || ''),
        maxTokens: depth === 'pro' ? 2500 : depth === 'normal' ? 1500 : 800,
        timeout: 60000,
        temperature: 0.7,
      };

    case 'xiaoliuren':
      return {
        system: XIAOLIUREN_PROMPT_TEMPLATE.system(depth),
        user: XIAOLIUREN_PROMPT_TEMPLATE.user(data, question || ''),
        maxTokens: depth === 'pro' ? 2500 : depth === 'normal' ? 1500 : 800,
        timeout: 60000,
        temperature: 0.7,
      };

    case 'zeji':
      return {
        system: ZEJI_PROMPT_TEMPLATE.system(depth),
        user: ZEJI_PROMPT_TEMPLATE.user(data),
        maxTokens: depth === 'pro' ? 2500 : depth === 'normal' ? 1500 : 800,
        timeout: 60000,
        temperature: 0.7,
      };

    case 'xunwu':
      return {
        system: XUNWU_PROMPT_TEMPLATE.system(depth),
        user: XUNWU_PROMPT_TEMPLATE.user(data, question || ''),
        maxTokens: depth === 'pro' ? 2500 : depth === 'normal' ? 1500 : 800,
        timeout: 60000,
        temperature: 0.7,
      };

    case 'hehun':
      return {
        system: HEHUN_PROMPT_TEMPLATE.system(depth),
        user: HEHUN_PROMPT_TEMPLATE.user(data),
        maxTokens: depth === 'pro' ? 3500 : depth === 'normal' ? 2500 : 1500,
        timeout: 120000,
        temperature: 0.7,
      };

    case 'naming':
    case 'namingCheck':
      return {
        system: NAMING_PROMPT_TEMPLATE.system(depth),
        user: NAMING_PROMPT_TEMPLATE.user(data),
        maxTokens: depth === 'pro' ? 5000 : depth === 'normal' ? 3500 : 2000,
        timeout: 120000,
        temperature: 0.8,
      };

    // 其他类型保持原有逻辑
    default:
      // 保留原有的 switch case
      return this.getOriginalPromptConfig(type, data, extraParams);
  }
}
```

### 3. 前端调用示例

在前端占卜结果页面添加深度选择：

```vue
<template>
  <div class="ai-depth-selector">
    <van-radio-group v-model="aiDepth" direction="horizontal">
      <van-radio name="simple">简明</van-radio>
      <van-radio name="normal">标准</van-radio>
      <van-radio name="pro">专业</van-radio>
    </van-radio-group>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const aiDepth = ref('normal');

const fetchAiResult = async () => {
  const response = await fetch('/api/divination/ai-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'bazi',
      data: baziData,
      extraParams: {
        depth: aiDepth.value,
        question: userQuestion.value,
      },
      recordId: recordId.value,
    }),
  });
  
  // 处理 SSE 流式响应
  const reader = response.body.getReader();
  // ...
};
</script>
```

## 测试计划

### 1. 单元测试

测试每个提示词模板的输出：

```typescript
describe('Prompt Templates', () => {
  it('should generate correct bazi prompt for simple depth', () => {
    const system = BAZI_PROMPT_TEMPLATE.system('simple');
    expect(system).toContain('100-150字');
  });

  it('should generate correct bazi prompt for pro depth', () => {
    const system = BAZI_PROMPT_TEMPLATE.system('pro');
    expect(system).toContain('专业模式要求');
  });
});
```

### 2. 集成测试

测试 AI Service 的完整流程：

```typescript
describe('AI Service', () => {
  it('should return different maxTokens for different depths', () => {
    const simpleConfig = aiService.getPromptConfig('bazi', data, { depth: 'simple' });
    const proConfig = aiService.getPromptConfig('bazi', data, { depth: 'pro' });
    
    expect(simpleConfig.maxTokens).toBeLessThan(proConfig.maxTokens);
  });
});
```

### 3. E2E 测试

测试前端到后端的完整流程：

1. 用户选择"简明模式"
2. 提交占卜请求
3. 验证返回的 AI 解读字数符合预期（100-150字）
4. 验证 JSON 格式正确

## 部署步骤

1. **提交代码**
```bash
git add backend/src/divination/prompts/
git add backend/src/divination/ai-depth.config.ts
git commit -m "feat: 优化 AI 解读提示词，增加深度等级"
```

2. **构建测试**
```bash
cd backend
npm run build
npm run test
```

3. **部署到生产环境**
```bash
# 重启后端服务
pm2 restart backend
```

4. **监控 AI 调用**
- 监控 Token 消耗
- 监控响应时间
- 监控 JSON 解析成功率
- 收集用户反馈

## 回滚方案

如果出现问题，可以快速回滚：

```bash
# 恢复备份文件
cp backend/src/divination/ai.service.ts.backup backend/src/divination/ai.service.ts

# 重新构建
npm run build

# 重启服务
pm2 restart backend
```

## 预期效果

### 成本优化
- 简明模式：节省 70% API 成本
- 标准模式：当前成本
- 专业模式：增加 50% 成本，但提供更深度的分析

### 用户体验
- 简明模式：5秒内响应，适合快速查看
- 标准模式：10秒内响应，适合日常使用
- 专业模式：20秒内响应，适合深入研究

### 质量提升
- 结构化输出更稳定（JSON 格式）
- 用户问题上下文更精准
- 过往验证增加可信度（专业模式）
