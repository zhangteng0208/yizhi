#!/bin/bash
# 易知国学经典库 - 数据完整性检查脚本

echo "=========================================="
echo "易知国学经典库 - 数据完整性检查"
echo "=========================================="
echo ""

BASE_DIR="/Users/mac/projects/yizhi/frontend/public/data/classics"

# 定义所有分类
declare -A CATEGORIES=(
  ["daozang"]="道藏"
  ["fozang"]="佛藏"
  ["ruzang"]="儒藏"
  ["jizang"]="集藏"
  ["shizang"]="诗藏"
  ["shishizang"]="史藏"
  ["yizang"]="医藏"
  ["yishuzang"]="艺藏"
  ["yz"]="易藏"
  ["zizang"]="子藏"
)

total_books=0
total_chapters=0
total_issues=0

for category in "${!CATEGORIES[@]}"; do
  category_dir="$BASE_DIR/$category"
  booklist_file="$category_dir/_booklist.json"

  echo "检查 ${CATEGORIES[$category]} ($category)..."

  if [ ! -d "$category_dir" ]; then
    echo "  ❌ 目录不存在: $category_dir"
    ((total_issues++))
    continue
  fi

  if [ ! -f "$booklist_file" ]; then
    echo "  ❌ 索引文件不存在: $booklist_file"
    ((total_issues++))
    continue
  fi

  # 统计书籍数量
  book_count=$(ls -1 "$category_dir"/*.json 2>/dev/null | grep -v "_booklist.json" | wc -l | tr -d ' ')
  booklist_count=$(grep -c '"id"' "$booklist_file" 2>/dev/null || echo 0)

  echo "  📚 JSON文件数: $book_count"
  echo "  📋 索引记录数: $booklist_count"

  if [ "$book_count" != "$booklist_count" ]; then
    echo "  ⚠️  数量不匹配！"
    ((total_issues++))
  else
    echo "  ✅ 数量一致"
  fi

  # 检查空文件
  empty_files=$(find "$category_dir" -name "*.json" -size -100c 2>/dev/null | wc -l | tr -d ' ')
  if [ "$empty_files" -gt 0 ]; then
    echo "  ⚠️  发现 $empty_files 个可能为空的文件"
    ((total_issues++))
  fi

  # 统计总章节数（从booklist读取）
  if command -v node &> /dev/null; then
    chapters=$(node -e "
      const fs = require('fs');
      try {
        const data = JSON.parse(fs.readFileSync('$booklist_file', 'utf-8'));
        const total = data.reduce((sum, book) => sum + (book.chapters || 0), 0);
        console.log(total);
      } catch(e) {
        console.log(0);
      }
    " 2>/dev/null || echo 0)
    echo "  📖 总章节数: $chapters"
    total_chapters=$((total_chapters + chapters))
  fi

  total_books=$((total_books + book_count))
  echo ""
done

echo "=========================================="
echo "汇总统计"
echo "=========================================="
echo "总书籍数: $total_books"
echo "总章节数: $total_chapters"
echo "发现问题: $total_issues"
echo ""

if [ $total_issues -eq 0 ]; then
  echo "✅ 所有检查通过！"
  exit 0
else
  echo "⚠️  发现 $total_issues 个问题，请检查上述输出"
  exit 1
fi
