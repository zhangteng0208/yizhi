#!/bin/bash
# AI 深度测试脚本

set -e

API_URL="${API_URL:-http://localhost:3000/api/divination/ai-stream}"
OUTPUT_DIR="./test-results"
DEPTHS=("simple" "normal" "pro")
TEST_COUNT=10

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 测试数据（示例八字）
TEST_DATA='{
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
    "depth": "DEPTH_PLACEHOLDER",
    "question": "今年事业运势如何？",
    "name": "测试用户",
    "gender": 1
  }
}'

echo "=========================================="
echo "AI 深度测试开始"
echo "API URL: $API_URL"
echo "测试次数: $TEST_COUNT 次/深度"
echo "=========================================="
echo ""

# 测试每种深度
for depth in "${DEPTHS[@]}"; do
  echo "📊 测试深度: $depth"
  echo "------------------------------------------"
  
  depth_dir="$OUTPUT_DIR/$depth"
  mkdir -p "$depth_dir"
  
  for i in $(seq 1 $TEST_COUNT); do
    echo -n "  测试 $i/$TEST_COUNT ... "
    
    # 替换深度参数
    request_data="${TEST_DATA//DEPTH_PLACEHOLDER/$depth}"
    
    # 记录开始时间
    start_time=$(date +%s.%N)
    
    # 发送请求
    response_file="$depth_dir/response_$i.json"
    http_code=$(curl -s -w "%{http_code}" -o "$response_file" \
      -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -d "$request_data")
    
    # 记录结束时间
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc)
    
    # 检查响应
    if [ "$http_code" = "200" ]; then
      # 尝试解析 JSON
      if jq empty "$response_file" 2>/dev/null; then
        char_count=$(jq -r 'to_entries | map(.value | tostring) | join("") | length' "$response_file" 2>/dev/null || echo "0")
        echo "✅ 成功 (${duration}s, ${char_count}字)"
        
        # 保存统计信息
        echo "$duration" >> "$depth_dir/durations.txt"
        echo "$char_count" >> "$depth_dir/char_counts.txt"
      else
        echo "❌ JSON 解析失败"
        echo "parse_error" >> "$depth_dir/errors.txt"
      fi
    else
      echo "❌ HTTP $http_code"
      echo "http_$http_code" >> "$depth_dir/errors.txt"
    fi
  done
  
  echo ""
done

echo "=========================================="
echo "测试完成！生成统计报告..."
echo "=========================================="
echo ""

# 生成统计报告
report_file="$OUTPUT_DIR/test_report.txt"
{
  echo "AI 深度测试报告"
  echo "================"
  echo ""
  echo "测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "API URL: $API_URL"
  echo "测试次数: $TEST_COUNT 次/深度"
  echo ""
  
  for depth in "${DEPTHS[@]}"; do
    depth_dir="$OUTPUT_DIR/$depth"
    
    echo "深度: $depth"
    echo "----------------------------------------"
    
    # 统计响应时间
    if [ -f "$depth_dir/durations.txt" ]; then
      avg_duration=$(awk '{sum+=$1; count++} END {print sum/count}' "$depth_dir/durations.txt")
      min_duration=$(sort -n "$depth_dir/durations.txt" | head -1)
      max_duration=$(sort -n "$depth_dir/durations.txt" | tail -1)
      echo "  响应时间: 平均 ${avg_duration}s, 最快 ${min_duration}s, 最慢 ${max_duration}s"
    fi
    
    # 统计字数
    if [ -f "$depth_dir/char_counts.txt" ]; then
      avg_chars=$(awk '{sum+=$1; count++} END {print int(sum/count)}' "$depth_dir/char_counts.txt")
      min_chars=$(sort -n "$depth_dir/char_counts.txt" | head -1)
      max_chars=$(sort -n "$depth_dir/char_counts.txt" | tail -1)
      echo "  输出字数: 平均 ${avg_chars}字, 最少 ${min_chars}字, 最多 ${max_chars}字"
    fi
    
    # 统计错误
    if [ -f "$depth_dir/errors.txt" ]; then
      error_count=$(wc -l < "$depth_dir/errors.txt")
      success_rate=$(echo "scale=2; ($TEST_COUNT - $error_count) * 100 / $TEST_COUNT" | bc)
      echo "  成功率: ${success_rate}% ($error_count 个错误)"
    else
      echo "  成功率: 100% (0 个错误)"
    fi
    
    echo ""
  done
  
  echo "测试结果保存在: $OUTPUT_DIR"
} | tee "$report_file"

echo ""
echo "✅ 测试报告已生成: $report_file"
