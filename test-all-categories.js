#!/usr/bin/env node

/**
 * 易知书籍分类全面测试脚本
 * 测试所有10个藏类的书籍数据完整性
 */

const fs = require('fs');
const path = require('path');

const BASE_PATH = path.join(__dirname, 'frontend/public/data/classics');

// 所有藏类配置
const categories = [
  { id: 'daozang', name: '道藏', dir: 'daozang' },
  { id: 'ruzang', name: '儒藏', dir: 'ruzang' },
  { id: 'fozang', name: '佛藏', dir: 'fozang' },
  { id: 'yz', name: '易藏', dir: 'yz' },
  { id: 'yizang', name: '医藏', dir: 'yizang' },
  { id: 'shizang', name: '诗藏', dir: 'shizang' },
  { id: 'jizang', name: '集藏', dir: 'jizang' },
  { id: 'zizang', name: '子藏', dir: 'zizang' },
  { id: 'shishizang', name: '史藏', dir: 'shishizang' },
  { id: 'yishuzang', name: '艺藏', dir: 'yishuzang' }
];

// 测试结果统计
const results = {
  total: 0,
  success: 0,
  failed: 0,
  errors: []
};

console.log('═══════════════════════════════════════════════════════');
console.log('          易知书籍分类全面测试');
console.log('═══════════════════════════════════════════════════════\n');

// 测试单个分类
function testCategory(category) {
  console.log(`\n📚 测试 ${category.name} (${category.dir})`);
  console.log('─────────────────────────────────────────────────────');

  const categoryPath = path.join(BASE_PATH, category.dir);
  const booklistPath = path.join(categoryPath, '_booklist.json');

  // 检查目录是否存在
  if (!fs.existsSync(categoryPath)) {
    console.log(`❌ 目录不存在: ${categoryPath}`);
    results.errors.push(`${category.name}: 目录不存在`);
    return;
  }

  // 检查_booklist.json是否存在
  if (!fs.existsSync(booklistPath)) {
    console.log(`❌ _booklist.json不存在`);
    results.errors.push(`${category.name}: _booklist.json不存在`);
    return;
  }

  // 读取书籍列表
  let booklist;
  try {
    const content = fs.readFileSync(booklistPath, 'utf8');
    booklist = JSON.parse(content);
  } catch (error) {
    console.log(`❌ 无法解析_booklist.json: ${error.message}`);
    results.errors.push(`${category.name}: JSON解析失败`);
    return;
  }

  console.log(`✓ 书籍列表: ${booklist.length}本`);

  // 随机测试5本书
  const testCount = Math.min(5, booklist.length);
  const testBooks = [];
  const indices = new Set();

  while (indices.size < testCount) {
    indices.add(Math.floor(Math.random() * booklist.length));
  }

  let categorySuccess = 0;
  let categoryFailed = 0;

  Array.from(indices).forEach(index => {
    const book = booklist[index];

    // 检查book对象是否有效
    if (!book) {
      console.log(`  ❌ 索引${index}: 书籍数据无效`);
      results.failed++;
      categoryFailed++;
      results.errors.push(`${category.name}/索引${index}: 书籍数据无效`);
      return;
    }

    // 道藏使用id作为文件名，其他藏类使用file字段
    const fileName = book.file || (book.id + '.json');
    const bookFile = path.join(categoryPath, fileName);

    results.total++;

    if (!fs.existsSync(bookFile)) {
      console.log(`  ❌ ${book.name}: 文件不存在`);
      results.failed++;
      categoryFailed++;
      results.errors.push(`${category.name}/${book.name}: 文件不存在`);
      return;
    }

    try {
      const bookContent = fs.readFileSync(bookFile, 'utf8');
      const bookData = JSON.parse(bookContent);

      if (!Array.isArray(bookData) || bookData.length === 0) {
        console.log(`  ❌ ${book.name}: 数据为空`);
        results.failed++;
        categoryFailed++;
        results.errors.push(`${category.name}/${book.name}: 数据为空`);
        return;
      }

      // 检查第一章是否有内容
      const firstChapter = bookData[0];
      if (!firstChapter.paragraphs || firstChapter.paragraphs.length === 0) {
        console.log(`  ❌ ${book.name}: 首章无内容`);
        results.failed++;
        categoryFailed++;
        results.errors.push(`${category.name}/${book.name}: 首章无内容`);
        return;
      }

      console.log(`  ✓ ${book.name}: ${bookData.length}章, 首章${firstChapter.paragraphs.length}段`);
      results.success++;
      categorySuccess++;

    } catch (error) {
      console.log(`  ❌ ${book.name}: ${error.message}`);
      results.failed++;
      categoryFailed++;
      results.errors.push(`${category.name}/${book.name}: ${error.message}`);
    }
  });

  console.log(`\n${category.name}测试结果: ✓ ${categorySuccess} / ❌ ${categoryFailed}`);
}

// 执行所有测试
categories.forEach(testCategory);

// 输出总结
console.log('\n═══════════════════════════════════════════════════════');
console.log('                  测试总结');
console.log('═══════════════════════════════════════════════════════');
console.log(`总测试数: ${results.total}`);
console.log(`成功: ${results.success} ✓`);
console.log(`失败: ${results.failed} ❌`);
console.log(`成功率: ${((results.success / results.total) * 100).toFixed(2)}%`);

if (results.errors.length > 0) {
  console.log('\n错误详情:');
  results.errors.forEach((error, index) => {
    console.log(`${index + 1}. ${error}`);
  });
}

console.log('\n═══════════════════════════════════════════════════════\n');

// 退出码
process.exit(results.failed > 0 ? 1 : 0);
