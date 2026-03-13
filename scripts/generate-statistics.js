const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('易知国学经典库 - 详细统计报告');
console.log('==========================================\n');

const baseDir = '/Users/mac/projects/yizhi/frontend/public/data/classics';

const categories = [
  { dir: 'daozang', name: '道藏', prefix: 'daozang/' },
  { dir: 'fozang', name: '佛藏', prefix: 'fozang/' },
  { dir: 'ruzang', name: '儒藏', prefix: 'ruzang/' },
  { dir: 'jizang', name: '集藏', prefix: 'jizang/' },
  { dir: 'shizang', name: '诗藏', prefix: 'shizang/' },
  { dir: 'shishizang', name: '史藏', prefix: 'shishizang/' },
  { dir: 'yizang', name: '医藏', prefix: 'yizang/' },
  { dir: 'yishuzang', name: '艺藏', prefix: 'yishuzang/' },
  { dir: 'yz', name: '易藏', prefix: 'yz/' },
  { dir: 'zizang', name: '子藏', prefix: 'zizang/' }
];

let totalBooks = 0;
let totalChapters = 0;
let totalParagraphs = 0;

const stats = [];

categories.forEach(cat => {
  const booklistPath = path.join(baseDir, cat.dir, '_booklist.json');

  if (!fs.existsSync(booklistPath)) {
    console.log(`⚠️  ${cat.name}: 索引文件不存在`);
    return;
  }

  try {
    const booklist = JSON.parse(fs.readFileSync(booklistPath, 'utf-8'));
    const bookCount = booklist.length;
    const chapterCount = booklist.reduce((sum, book) => sum + (book.chapters || 0), 0);

    // 计算平均章节数
    const avgChapters = bookCount > 0 ? (chapterCount / bookCount).toFixed(1) : 0;

    // 找出章节最多的书
    const maxChapterBook = booklist.reduce((max, book) =>
      (book.chapters || 0) > (max.chapters || 0) ? book : max
    , { chapters: 0, name: 'N/A' });

    // 找出章节最少的书
    const minChapterBook = booklist.reduce((min, book) =>
      (book.chapters || 0) < (min.chapters || Infinity) && (book.chapters || 0) > 0 ? book : min
    , { chapters: Infinity, name: 'N/A' });

    stats.push({
      name: cat.name,
      books: bookCount,
      chapters: chapterCount,
      avgChapters,
      maxBook: maxChapterBook,
      minBook: minChapterBook
    });

    totalBooks += bookCount;
    totalChapters += chapterCount;

  } catch (error) {
    console.log(`❌ ${cat.name}: 读取失败 - ${error.message}`);
  }
});

// 按书籍数量排序
stats.sort((a, b) => b.books - a.books);

// 输出详细统计
console.log('📊 各分类详细统计:\n');
stats.forEach((stat, index) => {
  console.log(`${index + 1}. ${stat.name}`);
  console.log(`   书籍数: ${stat.books.toLocaleString()} 本`);
  console.log(`   章节数: ${stat.chapters.toLocaleString()} 章`);
  console.log(`   平均章节: ${stat.avgChapters} 章/本`);
  console.log(`   最多章节: ${stat.maxBook.name} (${stat.maxBook.chapters}章)`);
  if (stat.minBook.chapters !== Infinity) {
    console.log(`   最少章节: ${stat.minBook.name} (${stat.minBook.chapters}章)`);
  }
  console.log('');
});

console.log('==========================================');
console.log('📈 总体统计');
console.log('==========================================');
console.log(`总书籍数: ${totalBooks.toLocaleString()} 本`);
console.log(`总章节数: ${totalChapters.toLocaleString()} 章`);
console.log(`平均章节: ${(totalChapters / totalBooks).toFixed(1)} 章/本`);
console.log('');

// 分类占比
console.log('📊 分类占比:');
stats.forEach(stat => {
  const percentage = ((stat.books / totalBooks) * 100).toFixed(1);
  const barLength = Math.round(percentage / 2);
  const bar = '█'.repeat(barLength) + '░'.repeat(50 - barLength);
  console.log(`${stat.name.padEnd(6)} ${bar} ${percentage}%`);
});

console.log('\n==========================================');
console.log(`报告生成时间: ${new Date().toLocaleString('zh-CN')}`);
console.log('==========================================');
