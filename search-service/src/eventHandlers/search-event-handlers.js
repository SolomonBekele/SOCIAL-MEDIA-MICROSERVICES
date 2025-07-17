const Search = require("../models/Search");
const logger = require("../utils/logger");
const { invalidatePostCache } = require("../utils/redisCache");



async function handlePostCreated(event) {
  try {
    const newSearchPost = new Search({
      postId: event.postId,
      userId: event.userId,
      content: event.content,
      createdAt: event.createdAt,
    });

    await newSearchPost.save();
    await invalidatePostCache()
    logger.info(
      `Search post created: ${event.postId}, ${newSearchPost._id.toString()}`
    );
  } catch (e) {
    logger.error(e, "Error handling post creation event");
  }
}

async function handlePostDeleted(event) {
  try {
    await Search.findOneAndDelete({ postId: event.postId });
    await invalidatePostCache()

    logger.info(`Search post deleted: ${event.postId}}`);
  } catch (error) {
    logger.error(error, "Error handling post deletion event");
  }
}

module.exports = { handlePostCreated, handlePostDeleted };