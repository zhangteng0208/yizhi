const fs = require('fs');
const path = require('path');

const sourceDir = '/Users/mac/projects/yizhi/daizhigev20/道藏/藏外';
const targetDir = '/Users/mac/projects/yizhi/frontend/public/data/classics/daozang';
const booklistPath = path.join(targetDir, '_booklist.json');

// 获取所有txt文件（藏外是平铺的，不需要递归）
function getAllTxtFiles(dir) {
  const list = fs.readdirSync(dir);
  return list
    .filter(file => file.endsWith('.txt'))
    .map(file => path.join(dir, file));
}

// 读取现有的booklist
let booklist = JSON.parse(fs.readFileSync(booklistPath, 'utf-8'));

// 获取所有txt文件
const files = getAllTxtFiles(sourceDir);

console.log(`找到 ${files.length} 个藏外文件待处理`);

let processed = 0;
let skipped = 0;

files.forEach((filePath, index) => {
  const filename = path.basename(filePath);
  const name = filename.replace('.txt', '');
  const jsonFilename = `${name}.json`;
  const targetPath = path.join(targetDir, jsonFilename);

  // 检查是否已存在
  if (fs.existsSync(targetPath)) {
    skipped++;
    return;
  }

  // 读取txt内容
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  // 转换为json格式
  const chapters = [{
    title: name,
    content: lines.map(line => line.trim())
  }];

  const jsonData = {
    title: name,
    author: "道藏",
    chapters: chapters
  };

  // 写入json文件
  fs.writeFileSync(targetPath, JSON.stringify(jsonData, null, 2), 'utf-8');

  // 添加到booklist（如果不存在）
  const exists = booklist.some(book => book.id === name);
  if (!exists) {
    booklist.push({
      id: name,
      name: name,
      chapters: 1,
      paragraphs: lines.length
    });
  }

  processed++;
  if ((index + 1) % 50 === 0) {
    console.log(`进度: ${index + 1}/${files.length}`);
  }
});

// 保存更新后的booklist
fs.writeFileSync(booklistPath, JSON.stringify(booklist, null, 2), 'utf-8');

console.log(`\n完成！`);
console.log(`处理: ${processed} 个文件`);
console.log(`跳过: ${skipped} 个文件`);
console.log(`道藏总计: ${booklist.length} 本书`);
