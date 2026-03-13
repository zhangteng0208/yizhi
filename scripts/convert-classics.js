#!/usr/bin/env node
/**
 * 将 daizhigev20 中的 txt 文件转换为 JSON 格式
 * 用于医藏、诗藏、易藏数据迁移
 */

const fs = require('fs');
const path = require('path');

// 读取 txt 文件并转换为 JSON 格式
function convertTxtToJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath, '.txt');
  
  // 按段落分割（空行分段）
  const paragraphs = content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  return [{
    chapter: fileName,
    paragraphs: paragraphs
  }];
}

// 递归处理目录
function processDirectory(sourceDir, targetDir, category) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const items = fs.readdirSync(sourceDir);
  let count = 0;
  
  for (const item of items) {
    const sourcePath = path.join(sourceDir, item);
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      // 递归处理子目录
      const subTargetDir = path.join(targetDir, item);
      count += processDirectory(sourcePath, subTargetDir, category);
    } else if (item.endsWith('.txt')) {
      // 转换 txt 文件
      try {
        const jsonData = convertTxtToJson(sourcePath);
        const jsonFileName = item.replace('.txt', '.json');
        const targetPath = path.join(targetDir, jsonFileName);
        
        fs.writeFileSync(targetPath, JSON.stringify(jsonData, null, 2), 'utf-8');
        count++;
        
        if (count % 50 === 0) {
          console.log(`${category}: 已处理 ${count} 个文件...`);
        }
      } catch (error) {
        console.error(`处理文件失败: ${sourcePath}`, error.message);
      }
    }
  }
  
  return count;
}

// 主函数
function main() {
  const baseDir = path.join(__dirname, '..');
  const sourceBase = path.join(baseDir, 'daizhigev20');
  const targetBase = path.join(baseDir, 'frontend/dist/data/classics');
  
  const categories = [
    { name: '易藏', source: '易藏', target: 'yizang' },
    { name: '诗藏', source: '诗藏', target: 'shizang' },
    { name: '医藏', source: '医藏', target: 'yizang_medical' }
  ];
  
  console.log('开始数据转换...\n');
  
  for (const category of categories) {
    console.log(`处理 ${category.name}...`);
    const sourceDir = path.join(sourceBase, category.source);
    const targetDir = path.join(targetBase, category.target);
    
    const count = processDirectory(sourceDir, targetDir, category.name);
    console.log(`${category.name} 完成: 共转换 ${count} 个文件\n`);
  }
  
  console.log('所有数据转换完成！');
}

main();
