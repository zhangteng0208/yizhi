#!/usr/bin/env node

/**
 * 道藏数据问题诊断和修复脚本
 */

const fs = require('fs');
const path = require('path');

const DAOZANG_PATH = path.join(__dirname, 'frontend/public/data/classics/daozang');

console.log('═══════════════════════════════════════════════════════');
console.log('          道藏数据问题诊断');
console.log('═══════════════════════════════════════════════════════\n');

// 读取书籍列表
const booklistPath = path.join(DAOZANG_PATH, '_booklist.json');
const booklist = JSON.parse(fs.readFileSync(booklistPath, 'utf8'));

console.log(`道藏总书籍数: ${booklist.length}本\n`);

// 统计数据
const stats = {
  total: booklist.length,
  valid: 0,
  empty: 0,
  missing: 0,
  emptyBooks: [],
  missingBooks: []
};

// 检查每本书
booklist.forEach((book, index) => {
  const fileName = book.id + '.json';
  const filePath = path.join(DAOZANG_PATH, fileName);

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    stats.missing++;
    stats.missingBooks.push(book.name);
    return;
  }

  // 检查文件内容
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    if (!Array.isArray(data) || data.length === 0) {
      stats.empty++;
      stats.emptyBooks.push(book.name);
    } else {
      // 检查第一章是否有内容
      const firstChapter = data[0];
      if (!firstChapter.paragraphs || firstChapter.paragraphs.length === 0) {
        stats.empty++;
        stats.emptyBooks.push(book.name);
      } else {
        stats.valid++;
      }
    }
  } catch (error) {
    stats.empty++;
    stats.emptyBooks.push(`${book.name} (解析错误)`);
  }
});

// 输出统计结果
console.log('统计结果:');
console.log('─────────────────────────────────────────────────────');
console.log(`✓ 有效数据: ${stats.valid}本 (${(stats.valid/stats.total*100).toFixed(2)}%)`);
console.log(`❌ 空数据: ${stats.empty}本 (${(stats.empty/stats.total*100).toFixed(2)}%)`);
console.log(`⚠️ 文件缺失: ${stats.missing}本 (${(stats.missing/stats.total*100).toFixed(2)}%)`);

// 输出空数据书籍列表（前20本）
if (stats.emptyBooks.length > 0) {
  console.log('\n空数据书籍列表 (前20本):');
  console.log('─────────────────────────────────────────────────────');
  stats.emptyBooks.slice(0, 20).forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });

  if (stats.emptyBooks.length > 20) {
    console.log(`... 还有 ${stats.emptyBooks.length - 20} 本`);
  }
}

// 输出缺失文件列表
if (stats.missingBooks.length > 0) {
  console.log('\n文件缺失书籍列表:');
  console.log('─────────────────────────────────────────────────────');
  stats.missingBooks.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });
}

console.log('\n═══════════════════════════════════════════════════════');

// 生成修复建议
console.log('\n修复建议:');
console.log('─────────────────────────────────────────────────────');

if (stats.empty > 0) {
  console.log(`1. 空数据问题 (${stats.empty}本):`);
  console.log('   - 检查原始数据源');
  console.log('   - 重新导入数据');
  console.log('   - 或者在前端显示"内容暂未收录"提示');
}

if (stats.missing > 0) {
  console.log(`\n2. 文件缺失问题 (${stats.missing}本):`);
  console.log('   - 从_booklist.json中移除这些条目');
  console.log('   - 或者补充缺失的数据文件');
}

console.log('\n═══════════════════════════════════════════════════════\n');

// 保存详细报告
const report = {
  timestamp: new Date().toISOString(),
  stats,
  emptyBooks: stats.emptyBooks,
  missingBooks: stats.missingBooks
};

const reportPath = path.join(__dirname, 'daozang-diagnosis-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`详细报告已保存到: ${reportPath}\n`);
