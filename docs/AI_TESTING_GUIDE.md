# AI 深度测试 - 使用指南

## 快速开始

### 1. 准备环境

确保后端服务正在运行：

```bash
cd backend
npm run start:dev
```

### 2. 运行测试

```bash
cd scripts
chmod +x test-ai-depth.sh
./test-ai-depth.sh
```

### 3. 分析结果

```bash
node analyze-test-results.js
```

## 测试脚本说明

### test-ai-depth.sh

自动化测试脚本，测试三种深度模式的功能和性能。

**功能**：
- 对每种深度（simple/normal/pro）发送 10 次请求
- 记录响应时间
- 统计输出字数
- 检测 JSON 解析错误
- 生成测试报告

**环境变量**：
```bash
# 自定义 API URL
API_URL=http://localhost:3000/api/divination/ai-stream ./test-ai-depth.sh

# 自定义测试次数（修改脚本中的 TEST_COUNT）
```

**输出目录结构**：
```
test-results/
├── simple/
│   ├── response_1.json
│   ├── response_2.json
│   ├── ...
│   ├── durations.txt
│   ├── char_counts.txt
│   └── errors.txt
├── normal/
│   └── ...
├── pro/
│   └── ...
└── test_report.txt
```

### analyze-test-results.js

结果分析脚本，生成详细的统计报告。

**功能**：
- 计算平均响应时间、最快、最慢
- 计算平均字数、最少、最多
- 统计成功率和错误类型
- 对比目标值，判断是否达标
- 生成 JSON 格式的详细报告

**输出**：
- 控制台输出详细报告
- 生成 `test-results/analysis_report.json`

**示例输出**：
```
========================================
AI 深度测试结果分析
========================================

📊 详细测试结果

深度: SIMPLE
----------------------------------------
测试次数: 10
成功率: 100.00% (0 个错误)

响应时间:
  平均: 6.23s ✅ (目标: < 10s)
  最快: 5.12s
  最慢: 7.89s

输出字数:
  平均: 128 字 ✅ (目标: 100-150 字)
  最少: 105 字
  最多: 148 字

...

📈 对比表格

| 深度 | 测试次数 | 成功率 | 平均响应时间 | 平均字数 | 目标达成 |
|------|---------|--------|------------|---------|---------|
| simple | 10 | 100.0% | 6.23s | 128 | ✅ |
| normal | 10 | 100.0% | 11.45s | 387 | ✅ |
| pro | 10 | 100.0% | 19.67s | 956 | ✅ |

验收结果: ✅ 通过
```

## 手动测试

### 测试简明模式

```bash
curl -X POST http://localhost:3000/api/divination/ai-stream \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bazi",
    "data": {
      "rawBaZi": "甲子 丙寅 戊辰 庚午",
      "siZhu": {
        "year": {"tianGan": "甲", "diZhi": "子"},
        "month": {"tianGan": "丙", "diZhi": "寅"},
        "day": {"tianGan": "戊", "diZhi": "辰"},
        "hour": {"tianGan": "庚", "diZhi": "午"}
      }
    },
    "extraParams": {
      "depth": "simple",
      "question": "今年事业运势如何？",
      "name": "测试用户",
      "gender": 1
    }
  }'
```

### 测试标准模式

```bash
# 将 "depth": "simple" 改为 "depth": "normal"
```

### 测试专业模式

```bash
# 将 "depth": "simple" 改为 "depth": "pro"
```

## 前端测试

### 1. 启动前端

```bash
cd frontend
npm run dev
```

### 2. 测试流程

1. 访问 http://localhost:5173
2. 填写测算信息，提交
3. 在结果页面，查看深度选择器
4. 选择不同深度，点击"分析详解"
5. 观察响应时间和输出内容

### 3. 检查点

- [ ] 深度选择器正确显示
- [ ] 三个选项卡样式正确
- [ ] 默认选中"标准"模式
- [ ] 点击切换正常工作
- [ ] 深度提示文本正确显示
- [ ] 请求包含正确的 depth 参数
- [ ] AI 解读内容符合预期

## 性能测试

### 使用 Apache Bench

```bash
# 安装 ab
brew install httpd  # macOS
apt-get install apache2-utils  # Ubuntu

# 并发测试（50 个请求，10 个并发）
ab -n 50 -c 10 -p request.json -T application/json \
  http://localhost:3000/api/divination/ai-stream
```

### 使用 wrk

```bash
# 安装 wrk
brew install wrk  # macOS

# 压力测试（持续 30 秒，10 个并发）
wrk -t10 -c10 -d30s -s post.lua http://localhost:3000/api/divination/ai-stream
```

## 质量测试

### 内容质量评估

创建评估表格：

| 测试ID | 深度 | 准确性 | 完整性 | 可读性 | 专业性 | 总分 |
|--------|------|--------|--------|--------|--------|------|
| 1 | simple | 4 | 5 | 5 | 3 | 4.25 |
| 2 | normal | 5 | 5 | 4 | 4 | 4.5 |
| 3 | pro | 5 | 5 | 4 | 5 | 4.75 |

评分标准（1-5分）：
- 5分：优秀，完全符合预期
- 4分：良好，基本符合预期
- 3分：一般，部分符合预期
- 2分：较差，不太符合预期
- 1分：很差，完全不符合预期

### JSON 格式验证

```bash
# 验证 JSON 格式
jq empty test-results/simple/response_1.json

# 检查必填字段
jq 'has("zonglun") and has("shiye") and has("caiyun")' \
  test-results/simple/response_1.json
```

## 成本分析

### 统计 Token 消耗

在后端添加日志：

```typescript
// ai.service.ts
async fetchAi(...) {
  const response = await this.openai.chat.completions.create(...);
  
  // 记录 Token 消耗
  console.log(`[AI] depth=${depth}, tokens=${response.usage.total_tokens}`);
  
  return response;
}
```

### 分析成本

```bash
# 从日志中提取 Token 数据
grep "\[AI\]" backend.log | awk '{print $3, $4}' > tokens.txt

# 计算平均成本
# 假设 1000 tokens = $0.002
awk '{sum+=$2} END {print "Total tokens:", sum, "Cost: $" sum*0.002/1000}' tokens.txt
```

## 常见问题

### Q: 测试脚本报错 "Connection refused"

**A**: 确保后端服务正在运行：
```bash
cd backend
npm run start:dev
```

### Q: JSON 解析失败

**A**: 检查 AI 输出是否包含 markdown 代码块标记：
```json
// ❌ 错误
```json
{"zonglun": "..."}
```

// ✅ 正确
{"zonglun": "..."}
```

### Q: 响应时间过长

**A**: 可能原因：
1. AI API 响应慢（检查网络）
2. maxTokens 设置过大（调整参数）
3. 提示词过长（优化提示词）

### Q: 输出字数不符合预期

**A**: 调整提示词中的字数要求：
```typescript
// 简明模式
请用 100-150 字总结  // 调整为 80-120 字
```

## 下一步

1. **执行测试**：运行自动化测试脚本
2. **分析结果**：查看测试报告，找出问题
3. **优化调整**：根据测试结果优化参数
4. **用户测试**：上线 A/B 测试，收集反馈
5. **持续改进**：根据数据持续优化

---

**测试目标**：
- JSON 解析成功率 > 95%
- 响应时间符合预期
- 输出字数符合预期
- 内容质量评分 > 4.0
- 成本节省 > 15%
