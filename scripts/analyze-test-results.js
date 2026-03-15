const fs = require('fs');
const path = require('path');

/**
 * AI 深度测试结果分析脚本
 */

const RESULTS_DIR = './test-results';
const DEPTHS = ['simple', 'normal', 'pro'];

// 目标值
const TARGETS = {
  simple: {
    maxTokens: 1500,
    responseTime: 10,
    charRange: [100, 150],
  },
  normal: {
    maxTokens: 2500,
    responseTime: 15,
    charRange: [300, 500],
  },
  pro: {
    maxTokens: 4000,
    responseTime: 25,
    charRange: [800, 1200],
  },
};

function analyzeDepth(depth) {
  const depthDir = path.join(RESULTS_DIR, depth);
  
  if (!fs.existsSync(depthDir)) {
    console.log(`⚠️  ${depth} 目录不存在，跳过`);
    return null;
  }

  const result = {
    depth,
    count: 0,
    durations: [],
    charCounts: [],
    errors: [],
    parseErrors: 0,
    httpErrors: 0,
  };

  // 读取响应时间
  const durationsFile = path.join(depthDir, 'durations.txt');
  if (fs.existsSync(durationsFile)) {
    const durations = fs.readFileSync(durationsFile, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => parseFloat(line));
    result.durations = durations;
    result.count = durations.length;
  }

  // 读取字数
  const charCountsFile = path.join(depthDir, 'char_counts.txt');
  if (fs.existsSync(charCountsFile)) {
    const charCounts = fs.readFileSync(charCountsFile, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => parseInt(line));
    result.charCounts = charCounts;
  }

  // 读取错误
  const errorsFile = path.join(depthDir, 'errors.txt');
  if (fs.existsSync(errorsFile)) {
    const errors = fs.readFileSync(errorsFile, 'utf8')
      .split('\n')
      .filter(line => line.trim());
    result.errors = errors;
    result.parseErrors = errors.filter(e => e === 'parse_error').length;
    result.httpErrors = errors.filter(e => e.startsWith('http_')).length;
  }

  return result;
}

function calculateStats(numbers) {
  if (numbers.length === 0) return { avg: 0, min: 0, max: 0 };
  
  const sum = numbers.reduce((a, b) => a + b, 0);
  const avg = sum / numbers.length;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  
  return { avg, min, max };
}

function checkTarget(value, target, type = 'max') {
  if (type === 'max') {
    return value <= target ? '✅' : '❌';
  } else if (type === 'range') {
    return value >= target[0] && value <= target[1] ? '✅' : '⚠️';
  }
  return '?';
}

function main() {
  console.log('========================================');
  console.log('AI 深度测试结果分析');
  console.log('========================================\n');

  const allResults = {};
  
  for (const depth of DEPTHS) {
    const result = analyzeDepth(depth);
    if (result) {
      allResults[depth] = result;
    }
  }

  // 生成详细报告
  console.log('📊 详细测试结果\n');
  
  for (const depth of DEPTHS) {
    const result = allResults[depth];
    if (!result) continue;

    const target = TARGETS[depth];
    const durationStats = calculateStats(result.durations);
    const charStats = calculateStats(result.charCounts);
    const successRate = ((result.count - result.errors.length) / result.count * 100).toFixed(2);

    console.log(`深度: ${depth.toUpperCase()}`);
    console.log('----------------------------------------');
    console.log(`测试次数: ${result.count}`);
    console.log(`成功率: ${successRate}% (${result.errors.length} 个错误)`);
    
    if (result.parseErrors > 0) {
      console.log(`  - JSON 解析错误: ${result.parseErrors}`);
    }
    if (result.httpErrors > 0) {
      console.log(`  - HTTP 错误: ${result.httpErrors}`);
    }
    
    console.log(`\n响应时间:`);
    console.log(`  平均: ${durationStats.avg.toFixed(2)}s ${checkTarget(durationStats.avg, target.responseTime)} (目标: < ${target.responseTime}s)`);
    console.log(`  最快: ${durationStats.min.toFixed(2)}s`);
    console.log(`  最慢: ${durationStats.max.toFixed(2)}s`);
    
    console.log(`\n输出字数:`);
    console.log(`  平均: ${Math.round(charStats.avg)} 字 ${checkTarget(charStats.avg, target.charRange, 'range')} (目标: ${target.charRange[0]}-${target.charRange[1]} 字)`);
    console.log(`  最少: ${charStats.min} 字`);
    console.log(`  最多: ${charStats.max} 字`);
    
    console.log('\n');
  }

  // 生成对比表格
  console.log('📈 对比表格\n');
  console.log('| 深度 | 测试次数 | 成功率 | 平均响应时间 | 平均字数 | 目标达成 |');
  console.log('|------|---------|--------|------------|---------|---------|');
  
  for (const depth of DEPTHS) {
    const result = allResults[depth];
    if (!result) continue;

    const target = TARGETS[depth];
    const durationStats = calculateStats(result.durations);
    const charStats = calculateStats(result.charCounts);
    const successRate = ((result.count - result.errors.length) / result.count * 100).toFixed(1);
    
    const durationCheck = checkTarget(durationStats.avg, target.responseTime);
    const charCheck = checkTarget(charStats.avg, target.charRange, 'range');
    const allCheck = durationCheck === '✅' && charCheck === '✅' && successRate >= 95 ? '✅' : '❌';
    
    console.log(`| ${depth} | ${result.count} | ${successRate}% | ${durationStats.avg.toFixed(2)}s | ${Math.round(charStats.avg)} | ${allCheck} |`);
  }

  console.log('\n');

  // 生成 JSON 报告
  const jsonReport = {
    timestamp: new Date().toISOString(),
    results: allResults,
    summary: {
      totalTests: Object.values(allResults).reduce((sum, r) => sum + r.count, 0),
      totalErrors: Object.values(allResults).reduce((sum, r) => sum + r.errors.length, 0),
    },
  };

  const reportFile = path.join(RESULTS_DIR, 'analysis_report.json');
  fs.writeFileSync(reportFile, JSON.stringify(jsonReport, null, 2));
  console.log(`✅ JSON 报告已生成: ${reportFile}\n`);

  // 总结
  console.log('========================================');
  console.log('总结');
  console.log('========================================');
  console.log(`总测试次数: ${jsonReport.summary.totalTests}`);
  console.log(`总错误数: ${jsonReport.summary.totalErrors}`);
  console.log(`总成功率: ${((jsonReport.summary.totalTests - jsonReport.summary.totalErrors) / jsonReport.summary.totalTests * 100).toFixed(2)}%`);
  
  const allPassed = Object.values(allResults).every(result => {
    const target = TARGETS[result.depth];
    const durationStats = calculateStats(result.durations);
    const charStats = calculateStats(result.charCounts);
    const successRate = (result.count - result.errors.length) / result.count * 100;
    
    return durationStats.avg <= target.responseTime &&
           charStats.avg >= target.charRange[0] &&
           charStats.avg <= target.charRange[1] &&
           successRate >= 95;
  });
  
  console.log(`\n验收结果: ${allPassed ? '✅ 通过' : '❌ 未通过'}`);
}

main();
