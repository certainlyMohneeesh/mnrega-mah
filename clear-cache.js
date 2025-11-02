const { Redis } = require('@ioredis/client');

async function clearCache() {
  const redis = new Redis(process.env.UPSTASH_REDIS_URL);
  
  try {
    console.log('🗑️  Clearing Redis cache...');
    
    // Get all keys
    const keys = await redis.keys('*');
    console.log(`Found ${keys.length} keys in cache`);
    
    if (keys.length > 0) {
      // Delete all keys
      await redis.del(...keys);
      console.log('✅ Cache cleared successfully!');
    } else {
      console.log('ℹ️  Cache was already empty');
    }
    
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
  } finally {
    await redis.quit();
  }
}

clearCache();
