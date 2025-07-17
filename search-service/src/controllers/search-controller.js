const Search = require("../models/Search");
const logger = require("../utils/logger");

//implement caching here for 2 to 5 min

const { getPostCache,createPostCache } = require("../utils/redisCache"); 

const searchPostController = async (req, res) => {
  logger.info("Search endpoint hit!");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const { query } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Query parameter is required" });
    }

    const cacheKey = `searches:${page}:${limit}:${query}`;
    
    // ✅ Use getPostCache with custom Redis client (req.redisClient)
    const cachedPosts = await getPostCache(cacheKey);

    if (cachedPosts) {
      logger.info("Cache hit!");
      return res.json(cachedPosts);
    }
    const results = await Search.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .skip(startIndex)
      .limit(limit);

    // Save results in Redis (expire in 5 minutes)
    await createPostCache(cacheKey, results);

    res.json(results);
  } catch (e) {
    logger.error("Error while searching post", e);
    res.status(500).json({
      success: false,
      message: "Error while searching post",
    });
  }
};


module.exports = { searchPostController };