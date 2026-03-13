# 易知国学经典库 - 快速维护参考

## 📊 当前状态
- **总书籍**: 15,650本
- **总章节**: 696,180章
- **数据大小**: ~2GB
- **最后更新**: 2026-03-11

## 🚀 快速命令

### 日常检查
```bash
# 检查数据完整性
./scripts/check-data-integrity.sh

# 生成统计报告
node scripts/generate-statistics.js

# 验证JSON格式
node scripts/validate-json.js
```

### 备份恢复
```bash
# 创建备份
./scripts/backup-classics.sh

# 查看备份列表
ls -lh /Users/mac/backups/yizhi-classics/

# 恢复备份
cd /Users/mac/projects/yizhi/frontend/public/data
tar -xzf /Users/mac/backups/yizhi-classics/classics-YYYYMMDD_HHMMSS.tar.gz
```

### 数据转换
```bash
# 重新转换某个分类（以诗藏为例）
node convert_shizang.js

# 批量转换所有分类
for script in convert_*.js; do node "$script"; done
```

## 📁 重要路径

### 数据目录
```
/Users/mac/projects/yizhi/frontend/public/data/classics/
├── daozang/          # 道藏
├── fozang/           # 佛藏
├── ruzang/           # 儒藏
├── jizang/           # 集藏
├── shizang/          # 诗藏
├── shishizang/       # 史藏
├── yizang/           # 医藏
├── yishuzang/        # 艺藏
├── yz/               # 易藏
└── zizang/           # 子藏
```

### 源数据目录
```
/Users/mac/projects/yizhi/daizhigev20/
├── 道藏/
├── 佛藏/
├── 儒藏/
├── 集藏/
├── 诗藏/
├── 史藏/
├── 医藏/
├── 艺藏/
├── 易藏/
└── 子藏/
```

### 备份目录
```
/Users/mac/backups/yizhi-classics/
```

## 🔍 常见问题

### Q: 如何查找某本书？
```bash
# 在所有分类中搜索书名
grep -r "书名" /Users/mac/projects/yizhi/frontend/public/data/classics/*/_booklist.json
```

### Q: 如何统计某个分类的书籍数？
```bash
# 统计诗藏书籍数
cat /Users/mac/projects/yizhi/frontend/public/data/classics/shizang/_booklist.json | grep '"id"' | wc -l
```

### Q: 如何检查某本书的章节数？
```bash
# 查看某本书的章节数
cat /Users/mac/projects/yizhi/frontend/public/data/classics/shizang/唐诗三百首.json | grep '"chapter"' | wc -l
```

### Q: 如何查找重复的书籍？
```bash
# 查找所有_booklist.json中的重复书名
find /Users/mac/projects/yizhi/frontend/public/data/classics -name "_booklist.json" -exec cat {} \; | grep '"name"' | sort | uniq -d
```

## 🛡️ 安全提示

1. **修改前备份**: 任何修改操作前先运行备份脚本
2. **测试验证**: 修改后运行完整性检查和JSON验证
3. **版本控制**: 重要修改提交到Git
4. **定期备份**: 建议每周运行一次备份脚本

## 📞 紧急联系

如遇到严重问题：
1. 停止所有修改操作
2. 从最近的备份恢复
3. 检查Git历史记录
4. 联系技术团队

## 📝 维护日志

建议记录每次维护操作：
```bash
# 创建维护日志
echo "$(date): 执行了XXX操作" >> /Users/mac/projects/yizhi/maintenance.log
```

---
**快速参考版本**: v1.0
**更新日期**: 2026-03-11
