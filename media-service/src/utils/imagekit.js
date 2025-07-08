const ImageKit = require("imagekit");
const logger = require("./logger");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Upload buffer to ImageKit
const uploadMediaToImageKit = (file) => {
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: file.buffer, // File buffer
        fileName: file.originalname, // Original file name
      },
      (error, result) => {
        if (error) {
          logger.error("Error while uploading media to ImageKit", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

// Delete file from ImageKit using fileId
const deleteMediaFromImageKit = async (fileId) => {
  try {
    const result = await imagekit.deleteFile(fileId);
    logger.info("Media deleted successfully from ImageKit", fileId);
    return result;
  } catch (error) {
    logger.error("Error deleting media from ImageKit", error);
    throw error;
  }
};

module.exports = { uploadMediaToImageKit, deleteMediaFromImageKit };
