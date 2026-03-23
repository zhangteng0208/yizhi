import { PrismaClient, Prisma } from '@prisma/client';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const prisma = new PrismaClient();

async function clearAiResultCache() {
  console.log('开始清理AI解析结果缓存...');

  // 统计当前有多少条缓存记录
  const cachedCount = await prisma.divination_records.count({
    where: {
      result: { not: Prisma.JsonNull }
    }
  });

  console.log(`找到 ${cachedCount} 条包含AI解析结果的记录`);

  if (cachedCount === 0) {
    console.log('没有需要清理的缓存');
    return;
  }

  // 清理所有result字段
  const result = await prisma.divination_records.updateMany({
    where: {
      result: { not: Prisma.JsonNull }
    },
    data: {
      result: Prisma.JsonNull
    }
  });

  console.log(`✓ 成功清理 ${result.count} 条缓存记录`);

  // 验证清理结果
  const remainingCached = await prisma.divination_records.count({
    where: {
      result: { not: Prisma.JsonNull }
    }
  });

  console.log(`剩余缓存记录: ${remainingCached}`);
}

clearAiResultCache()
  .then(() => {
    console.log('清理完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('清理失败:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
