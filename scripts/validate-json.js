const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('易知国学经典库 - JSON格式验证');
console.log('==========================================\n');

const baseDir = '/Users/mac/projects/yizhi/frontend/public/data/classics';

const categories = [
  'daozang', 'fozang', 'ruzang', 'jizang', 'shizang',
  'shishizang', 'yizang', 'yishuzang', 'yz', 'zizang'
];

let totalFiles = 0;
let validFiles = 0;
let invalidFiles = 0;
const errors = [];

categories.forEach(category => {
  const categoryDir = path.join(baseDir, category);

  if (!fs.existsSync(categoryDir)) {
    console.log(`⚠️  跳过不存在的目录: ${category}`);
    return;
  }

  console.log(`检查 ${category}...`);

  const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    const filePath = path.join(categoryDir, file);
    totalFiles++;

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // 验证数据结构
      if (file === '_booklist.json') {
        // 验证索引文件
        if (!Array.isArray(data)) {
          throw new Error('索引文件必须是数组');
        }

        data.forEach((book, index) => {
          if (!book.id || !book.name || !book.category) {
            throw new Error(`索引第${index}项缺少必要字段`);
          }
        });
      } else {
        // 验证书籍文件
        if (!Array.isArray(data)) {
          throw new Error('书籍文件必须是数组');
        }

        if (data.length === 0) {
          throw new Error('书籍内容为空');
        }

        data.forEach((chapter, index) => {
          if (!chapter.chapter) {
            throw new Error(`第${index}章缺少chapter字段`);
          }
          if (!chapter.paragraphs || !Array.isArray(chapter.paragraphs)) {
            throw new Error(`第${index}章缺少paragraphs字段或格式错误`);
          }
        });
      }

      validFiles++;

    } catch (error) {
      invalidFiles++;
      errors.push({
        file: `${category}/${file}`,
        error: error.message
      });
    }
  });
});

console.log('\n==========================================');
console.log('验证结果');
console.log('==========================================');
console.log(`总文件数: ${totalFiles}`);
console.log(`✅ 有效文件: ${validFiles}`);
console.log(`❌ 无效文件: ${invalidFiles}`);

if (invalidFiles > 0) {
  console.log('\n错误详情:');
  errors.forEach((err, index) => {
    console.log(`\n${index + 1}. ${err.file}`);
    console.log(`   错误: ${err.error}`);
  });
  process.exit(1);
} else {
  console.log('\n✅ 所有JSON文件格式正确！');
  process.exit(0);
}
