#!/usr/bin/env node

/**
 * 道藏数据格式转换脚本
 * 将道藏的旧格式转换为标准格式
 */

const fs = require('fs');
const path = require('path');

const DAOZANG_PATH = path.join(__dirname, 'frontend/public/data/classics/daozang');

console.log('═══════════════════════════════════════════════════════');
console.log('          道藏数据格式转换');
console.log('═══════════════════════════════════════════════════════\n');

// 读取书籍列表
const booklistPath = path.join(DAOZANG_PATH, '_booklist.json');
const booklist = JSON.parse(fs.readFileSync(booklistPath, 'utf8'));

console.log(`道藏总书籍数: ${booklist.length}本\n`);

let converted = 0;
let skipped = 0;
let errors = 0;

booklist.forEach((book, index) => {
  const fileName = book.id + '.json';
  const filePath = path.join(DAOZANG_PATH, fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ 文件不存在: ${book.name}`);
    skipped++;
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    // 检查是否是旧格式 (有title, author, chapters字段)
    if (data.title && data.author && data.chapters) {
      // 旧格式，需要转换
      const newFormat = data.chapters.map((chapter, idx) => {
        return {
          chapter: chapter.title || `第${idx + 1}章`,
          paragraphs: chapter.content || []
        };
      });

      // 保存转换后的数据
      fs.writeFileSync(filePath, JSON.stringify(newFormat, null, 2), 'utf8');

      if ((converted + 1) % 100 === 0) {
        console.log(`已转换: ${converted + 1}本...`);
      }
      converted++;
    } else if (Array.isArray(data)) {
      // 已经是新格式，跳过
      skipped++;
    } else {
      console.log(`⚠️ 未知格式: ${book.name}`);
      errors++;
    }
  } catch (error) {
    console.log(`❌ 转换失败: ${book.name} - ${error.message}`);
    errors++;
  }
});

console.log('\n═══════════════════════════════════════════════════════');
console.log('                  转换完成');
console.log('═══════════════════════════════════════════════════════');
console.log(`✓ 成功转换: ${converted}本`);
console.log(`- 跳过(已是新格式): ${skipped}本`);
console.log(`❌ 转换失败: ${errors}本`);
console.log('═══════════════════════════════════════════════════════\n');
