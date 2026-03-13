#!/bin/bash
# 易知国学经典库 - 自动备份脚本

echo "=========================================="
echo "易知国学经典库 - 数据备份"
echo "=========================================="
echo ""

# 配置
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/Users/mac/backups/yizhi-classics"
SOURCE_DIR="/Users/mac/projects/yizhi/frontend/public/data/classics"
BACKUP_FILE="classics-$DATE.tar.gz"
KEEP_DAYS=30

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo "📦 开始备份..."
echo "源目录: $SOURCE_DIR"
echo "备份目录: $BACKUP_DIR"
echo "备份文件: $BACKUP_FILE"
echo ""

# 统计源目录大小
SOURCE_SIZE=$(du -sh "$SOURCE_DIR" | cut -f1)
echo "源目录大小: $SOURCE_SIZE"

# 创建备份
cd "$(dirname "$SOURCE_DIR")"
tar -czf "$BACKUP_DIR/$BACKUP_FILE" "$(basename "$SOURCE_DIR")" 2>&1

if [ $? -eq 0 ]; then
  BACKUP_SIZE=$(du -sh "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
  echo "✅ 备份成功！"
  echo "备份大小: $BACKUP_SIZE"
  echo "备份路径: $BACKUP_DIR/$BACKUP_FILE"
else
  echo "❌ 备份失败！"
  exit 1
fi

echo ""
echo "🗑️  清理旧备份（保留最近 $KEEP_DAYS 天）..."

# 删除超过指定天数的备份
find "$BACKUP_DIR" -name "classics-*.tar.gz" -mtime +$KEEP_DAYS -delete

# 列出当前所有备份
echo ""
echo "📋 当前备份列表:"
ls -lh "$BACKUP_DIR"/classics-*.tar.gz 2>/dev/null | awk '{print $9, "(" $5 ")"}'

echo ""
echo "=========================================="
echo "备份完成！"
echo "=========================================="
