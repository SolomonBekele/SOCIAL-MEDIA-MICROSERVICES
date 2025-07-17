const Redis = require("ioredis");

const redisClient = new Redis(process.env.REDIS_URL);

// Delete cache for a specific post and all search-related keys
async function invalidatePostCache() {
  const keys = await redisClient.keys("searches:*");
  console.log("caches deleted")
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
}

// Save data to cache with key `searches:<input>`
async function createPostCache(cachedKey, data) {
  await redisClient.setex(cachedKey, 300,JSON.stringify(data));
}

// Retrieve cached data for key `searches:<input>`
async function getPostCache(cachedKey) {
  const data = await redisClient.get(cachedKey);
  return data ? JSON.parse(data) : null;
}

module.exports = {
  invalidatePostCache,
  createPostCache,
  getPostCache,
};
