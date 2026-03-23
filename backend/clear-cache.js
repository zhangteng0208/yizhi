const { Client } = require('pg');
require('dotenv').config();

async function clearAiResultCache() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✓ 已连接到数据库');

    // 统计当前有多少条缓存记录
    const countResult = await client.query(
      'SELECT COUNT(*) as count FROM divination_records WHERE result IS NOT NULL'
    );
    const cachedCount = parseInt(countResult.rows[0].count);
    console.log(`找到 ${cachedCount} 条包含AI解析结果的记录`);

    if (cachedCount === 0) {
      console.log('没有需要清理的缓存');
      return;
    }

    // 清理所有result字段
    const updateResult = await client.query(
      'UPDATE divination_records SET result = NULL WHERE result IS NOT NULL'
    );
    console.log(`✓ 成功清理 ${updateResult.rowCount} 条缓存记录`);

    // 验证清理结果
    const verifyResult = await client.query(
      'SELECT COUNT(*) as count FROM divination_records WHERE result IS NOT NULL'
    );
    const remainingCached = parseInt(verifyResult.rows[0].count);
    console.log(`剩余缓存记录: ${remainingCached}`);

  } catch (error) {
    console.error('清理失败:', error);
    throw error;
  } finally {
    await client.end();
    console.log('✓ 数据库连接已关闭');
  }
}

clearAiResultCache()
  .then(() => {
    console.log('\n清理完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n清理失败:', error.message);
    process.exit(1);
  });
