const fs = require('fs');
const path = require('path');

// 源目录和目标目录 - 易藏使用 yz 目录
const sourceDir = '/Users/mac/projects/yizhi/daizhigev20/易藏';
const targetDir = '/Users/mac/projects/yizhi/frontend/public/data/classics/yz';

// 创建目标目录
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 书籍列表
const bookList = [];

// 递归遍历目录查找所有 txt 文件
function findAllTxtFiles(dir) {
  const results = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 递归遍历子目录
      results.push(...findAllTxtFiles(fullPath));
    } else if (item.endsWith('.txt')) {
      results.push(fullPath);
    }
  }

  return results;
}

// 处理单个 txt 文件
function processTxtFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, '.txt');

    // 简单分章节（按空行分段）
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length === 0) return null;

    // 使用文件名作为书名
    let bookTitle = fileName;

    // 将内容按章节分组（每 30 行作为一章）
    const chapters = [];
    let currentChapter = [];
    let chapterIndex = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

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
        paragraphs: lines
      });
    }

    // 生成文件名
    const jsonFileName = `${fileName}.json`;
    const jsonFilePath = path.join(targetDir, jsonFileName);

    // 写入 JSON 文件
    fs.writeFileSync(jsonFilePath, JSON.stringify(chapters, null, 2), 'utf-8');

    // 添加到书籍列表 - 使用 yz 前缀（易藏的简写）
    bookList.push({
      id: `yz/${jsonFileName.replace('.json', '')}`,
      name: bookTitle,
      category: '易学',
      categoryEn: 'yixue',
      chapters: chapters.length,
      file: jsonFileName
    });

    console.log(`✓ 已转换: ${fileName} (${chapters.length}章)`);
    return true;
  } catch (error) {
    console.error(`✗ 转换失败: ${filePath}`, error.message);
    return false;
  }
}

// 遍历所有文件
let totalBooks = 0;
let successBooks = 0;

console.log(`\n处理易藏书籍...`);

// 递归查找所有 txt 文件
const txtFiles = findAllTxtFiles(sourceDir);

console.log(`找到 ${txtFiles.length} 本书`);

for (const filePath of txtFiles) {
  totalBooks++;
  if (processTxtFile(filePath)) {
    successBooks++;
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
console.log(`\n✅ 易藏书籍使用 yz 目录和前缀，与医藏（yizang）区分开`);
