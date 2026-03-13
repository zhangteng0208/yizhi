const fs = require('fs');
const path = require('path');

// 源目录和目标目录
const sourceDir = '/Users/mac/projects/yizhi/daizhigev20/儒藏';
const targetDir = '/Users/mac/projects/yizhi/frontend/public/data/classics/ruzang';

// 创建目标目录
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 子分类映射
const categories = {
  '春秋': 'chunqiu',
  '乐经': 'yuejing',
  '礼经': 'lijing',
  '启蒙蒙学': 'qimeng',
  '尚书': 'shangshu',
  '诗经': 'shijing',
  '四书': 'sishu',
  '五经总义': 'wujing',
  '小学': 'xiaoxue',
  '孝经': 'xiaojing',
  '修身治家': 'xiushen',
  '语录': 'yulu'
};

// 书籍列表
const bookList = [];

// 处理单个 txt 文件
function processTxtFile(filePath, category, categoryEn) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, '.txt');

    // 简单分章节（按空行分段）
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length === 0) return null;

    // 从文件名获取书名（更可靠）
    let bookTitle = fileName;

    // 如果第一行是"钦定四库全书"，尝试从第二行获取书名
    if (lines[0].includes('钦定四库全书')) {
      // 第二行通常是书名
      const secondLine = lines[1] ? lines[1].trim() : '';
      if (secondLine && !secondLine.includes('提要') && !secondLine.includes('【臣】')) {
        // 提取书名（去掉分类信息）
        bookTitle = secondLine.split(/\s+/)[0] || fileName;
      }
    } else {
      // 第一行作为书名
      bookTitle = lines[0].trim();
    }

    // 如果书名还是包含"钦定四库全书"，就用文件名
    if (bookTitle.includes('钦定四库全书') || bookTitle.includes('经部') || bookTitle.length > 30) {
      bookTitle = fileName;
    }

    // 将内容按章节分组（这里简化处理，每 50 行作为一章）
    const chapters = [];
    let currentChapter = [];
    let chapterIndex = 1;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // 如果是章节标题（包含"第"字）
      if (line.includes('第') && line.length < 20) {
        if (currentChapter.length > 0) {
          chapters.push({
            chapter: `第${chapterIndex}章`,
            paragraphs: currentChapter
          });
          currentChapter = [];
          chapterIndex++;
        }
      }

      if (line) {
        currentChapter.push(line);
      }

      // 每 30 行自动分章
      if (currentChapter.length >= 30) {
        chapters.push({
          chapter: `第${chapterIndex}章`,
          paragraphs: currentChapter
        });
        currentChapter = [];
        chapterIndex++;
      }
    }

    // 添加最后一章
    if (currentChapter.length > 0) {
      chapters.push({
        chapter: `第${chapterIndex}章`,
        paragraphs: currentChapter
      });
    }

    // 如果没有章节，整本书作为一章
    if (chapters.length === 0) {
      chapters.push({
        chapter: '全文',
        paragraphs: lines.slice(1)
      });
    }

    // 生成文件名
    const jsonFileName = `${categoryEn}_${fileName}.json`;
    const jsonFilePath = path.join(targetDir, jsonFileName);

    // 写入 JSON 文件
    fs.writeFileSync(jsonFilePath, JSON.stringify(chapters, null, 2), 'utf-8');

    // 添加到书籍列表
    bookList.push({
      id: `ruzang/${jsonFileName.replace('.json', '')}`,
      name: bookTitle || fileName,
      category: category,
      categoryEn: categoryEn,
      chapters: chapters.length,
      file: jsonFileName
    });

    console.log(`✓ 已转换: ${category}/${fileName} (${chapters.length}章)`);
    return true;
  } catch (error) {
    console.error(`✗ 转换失败: ${filePath}`, error.message);
    return false;
  }
}

// 遍历所有子分类
let totalBooks = 0;
let successBooks = 0;

for (const [categoryName, categoryEn] of Object.entries(categories)) {
  const categoryPath = path.join(sourceDir, categoryName);

  if (!fs.existsSync(categoryPath)) {
    console.log(`跳过不存在的分类: ${categoryName}`);
    continue;
  }

  console.log(`\n处理分类: ${categoryName}`);

  const files = fs.readdirSync(categoryPath);
  const txtFiles = files.filter(f => f.endsWith('.txt'));

  console.log(`找到 ${txtFiles.length} 本书`);

  for (const file of txtFiles) {
    totalBooks++;
    const filePath = path.join(categoryPath, file);
    if (processTxtFile(filePath, categoryName, categoryEn)) {
      successBooks++;
    }
  }
}

// 生成书籍列表索引
const bookListPath = path.join(targetDir, '_booklist.json');
fs.writeFileSync(bookListPath, JSON.stringify(bookList, null, 2), 'utf-8');

console.log(`\n========== 转换完成 ==========`);
console.log(`总计: ${totalBooks} 本书`);
console.log(`成功: ${successBooks} 本书`);
console.log(`失败: ${totalBooks - successBooks} 本书`);
console.log(`书籍列表: ${bookListPath}`);
