# 易知国学经典库维护指南

## 📚 当前库存概况

**总计：15,661部经典书籍**

| 分类 | 数量 | 目录 | 特点 |
|------|------|------|------|
| 道藏 | 1,677部 | `/data/classics/daozang/` | 道家经典，修身养性 |
| 佛藏 | 5,135部 | `/data/classics/fozang/` | 佛教经典，明心见性 |
| 儒藏 | 912部 | `/data/classics/ruzang/` | 儒家经典，修齐治平 |
| 集藏 | 1,949部 | `/data/classics/jizang/` | 诗文集萃，文章典范 |
| 诗藏 | 778部 | `/data/classics/shizang/` | 诗词歌赋，韵律之美 |
| 史藏 | 2,044部 | `/data/classics/shishizang/` | 史书典籍，鉴古知今 |
| 医藏 | 911部 | `/data/classics/yizang/` | 医学经典，岐黄之术 |
| 艺藏 | 447部 | `/data/classics/yishuzang/` | 艺术典籍，琴棋书画 |
| 易藏 | 343部 | `/data/classics/yizang/` | 易学经典，阴阳变化 |
| 子藏 | 1,465部 | `/data/classics/zizang/` | 诸子百家，百家争鸣 |

## 🔧 维护工具

### 转换脚本
所有转换脚本位于项目根目录：
- `convert_shizang.js` - 诗藏转换
- `convert_jizang.js` - 集藏转换
- `convert_zizang.js` - 子藏转换
- `convert_shishizang.js` - 史藏转换
- `convert_yishuzang.js` - 艺藏转换
- `convert_ruzang.js` - 儒藏转换
- `convert_fozang.js` - 佛藏转换
- `convert_yizang_medical.js` - 医藏转换

### 数据格式
每本书籍的JSON格式：
```json
[
  {
    "chapter": "第1章",
    "paragraphs": [
      "段落1内容",
      "段落2内容"
    ]
  }
]
```

每个分类的索引文件 `_booklist.json` 格式：
```json
[
  {
    "id": "分类前缀/书名",
    "name": "书名",
    "category": "分类名称",
    "categoryEn": "分类英文",
    "chapters": 章节数,
    "file": "书名.json"
  }
]
```

## 📋 日常维护任务

### 1. 数据质量检查

#### 检查缺失文件
```bash
# 检查某个分类的完整性
cd /Users/mac/projects/yizhi/frontend/public/data/classics/shizang
ls *.json | wc -l  # 统计JSON文件数量

# 对比 _booklist.json 中的记录数
cat _booklist.json | grep '"id"' | wc -l
```

#### 检查空文件
```bash
# 查找空的或过小的JSON文件
find /Users/mac/projects/yizhi/frontend/public/data/classics -name "*.json" -size -100c
```

#### 验证JSON格式
```bash
# 验证JSON文件格式是否正确
for file in /Users/mac/projects/yizhi/frontend/public/data/classics/shizang/*.json; do
  node -e "JSON.parse(require('fs').readFileSync('$file', 'utf-8'))" || echo "错误: $file"
done
```

### 2. 内容优化

#### 重新分章
如果发现某些书籍章节划分不合理，可以调整转换脚本中的分章逻辑：
```javascript
// 当前是每30行一章，可以根据实际情况调整
if (currentChapter.length >= 30) {
  // 分章逻辑
}
```

#### 章节标题优化
可以通过识别文本中的章节标记来改进章节标题：
```javascript
// 识别常见的章节标记
if (line.match(/^第[一二三四五六七八九十百千]+章/) ||
    line.match(/^卷[一二三四五六七八九十百千]+/)) {
  // 使用识别到的标题
}
```

### 3. 搜索功能增强

#### 建立全文索引
```bash
# 创建搜索索引脚本
node scripts/build-search-index.js
```

#### 添加标签系统
为每本书添加标签，方便分类和检索：
```json
{
  "id": "shizang/唐诗三百首",
  "name": "唐诗三百首",
  "tags": ["唐诗", "诗歌", "经典", "必读"],
  "author": "蘅塘退士",
  "dynasty": "清"
}
```

### 4. 备份策略

#### 定期备份
```bash
#!/bin/bash
# backup-classics.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR="/Users/mac/backups/yizhi-classics"
SOURCE_DIR="/Users/mac/projects/yizhi/frontend/public/data/classics"

mkdir -p $BACKUP_DIR
tar -czf "$BACKUP_DIR/classics-$DATE.tar.gz" $SOURCE_DIR

# 保留最近30天的备份
find $BACKUP_DIR -name "classics-*.tar.gz" -mtime +30 -delete

echo "备份完成: classics-$DATE.tar.gz"
```

#### 版本控制
```bash
# 将数据文件纳入Git版本控制
cd /Users/mac/projects/yizhi
git add frontend/public/data/classics/
git commit -m "chore: 更新经典书籍数据 $(date +%Y-%m-%d)"
```

### 5. 性能优化

#### 压缩JSON文件
```bash
# 移除JSON中的空格和换行，减小文件体积
for file in /Users/mac/projects/yizhi/frontend/public/data/classics/*/*.json; do
  node -e "const fs=require('fs');const data=JSON.parse(fs.readFileSync('$file'));fs.writeFileSync('$file',JSON.stringify(data));"
done
```

#### 分页加载优化
对于章节特别多的书籍，考虑实现分页加载：
```javascript
// 只加载前10章的预览
const preview = data.slice(0, 10)
```

### 6. 用户体验改进

#### 添加阅读进度
```javascript
// 保存用户阅读位置
localStorage.setItem(`reading-${bookId}-${chapterId}`, JSON.stringify({
  position: scrollPosition,
  timestamp: Date.now()
}))
```

#### 书签功能
```javascript
// 添加书签
const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
bookmarks.push({
  bookId,
  chapterId,
  paragraph: paragraphIndex,
  note: userNote
})
```

#### 笔记功能
允许用户对段落添加笔记和批注。

### 7. 数据统计

#### 生成统计报告
```javascript
// statistics.js
const fs = require('fs');
const path = require('path');

const categories = ['daozang', 'fozang', 'ruzang', 'jizang', 'shizang',
                   'shishizang', 'yizang', 'yishuzang', 'yz', 'zizang'];

categories.forEach(cat => {
  const booklistPath = path.join(__dirname, `frontend/public/data/classics/${cat}/_booklist.json`);
  if (fs.existsSync(booklistPath)) {
    const booklist = JSON.parse(fs.readFileSync(booklistPath, 'utf-8'));
    const totalChapters = booklist.reduce((sum, book) => sum + book.chapters, 0);
    console.log(`${cat}: ${booklist.length}本书, ${totalChapters}章`);
  }
});
```

## 🐛 常见问题处理

### 问题1：书籍无法显示
**排查步骤：**
1. 检查 `_booklist.json` 中是否有该书的记录
2. 检查书籍JSON文件是否存在
3. 检查JSON格式是否正确
4. 检查前端路由配置是否包含该分类

### 问题2：章节内容乱码
**解决方案：**
```bash
# 检查文件编码
file -I /path/to/book.json

# 转换编码
iconv -f GBK -t UTF-8 input.txt > output.txt
```

### 问题3：搜索结果不准确
**优化方案：**
- 实现分词搜索
- 添加同义词支持
- 实现模糊匹配

## 📈 未来改进方向

### 1. 内容增强
- [ ] 添加书籍简介和作者信息
- [ ] 添加相关书籍推荐
- [ ] 添加书籍评分和评论
- [ ] 添加书籍封面图片

### 2. 功能扩展
- [ ] 实现全文搜索
- [ ] 添加收藏功能
- [ ] 添加阅读历史
- [ ] 实现跨书籍引用链接
- [ ] 添加朗读功能（TTS）
- [ ] 添加繁简转换

### 3. 数据质量
- [ ] 人工校对重要典籍
- [ ] 添加注释和译文
- [ ] 标注生僻字读音
- [ ] 添加插图和图表

### 4. 技术优化
- [ ] 实现CDN加速
- [ ] 添加离线缓存
- [ ] 优化移动端体验
- [ ] 实现服务端渲染（SSR）

## 📞 维护联系

如有问题或建议，请通过以下方式联系：
- GitHub Issues
- 项目文档
- 开发团队

---

**最后更新：** 2026-03-11
**维护者：** 易知项目团队
