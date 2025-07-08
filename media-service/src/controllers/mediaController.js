const Media = require("../models/Media");
const { uploadMediaToImageKit } = require("../utils/imagekit"); // ✅ Use imagekit utils
const logger = require("../utils/logger");

const uploadMedia = async (req, res) => {
  logger.info("Starting media upload");
  try {
    console.log(req.file, "req.filereq.file");

    if (!req.file) {
      logger.error("No file found. Please add a file and try again!");
      return res.status(400).json({
        success: false,
        message: "No file found. Please add a file and try again!",
      });
    }

    const { originalname, mimetype } = req.file;
    const userId = req.user.userId;

    logger.info(`File details: name=${originalname}, type=${mimetype}`);
    logger.info("Uploading to ImageKit starting...");

    const imageKitUploadResult = await uploadMediaToImageKit(req.file);
    logger.info(
      `ImageKit upload successful. File ID: ${imageKitUploadResult.fileId}`
    );

    const newlyCreatedMedia = new Media({
      publicId: imageKitUploadResult.fileId,
      originalName: originalname,
      mimeType: mimetype,
      url: imageKitUploadResult.url,
      userId,
    });

    await newlyCreatedMedia.save();

    res.status(201).json({
      success: true,
      mediaId: newlyCreatedMedia._id,
      url: newlyCreatedMedia.url,
      message: "Media upload is successfully",
    });
  } catch (error) {
    logger.error("Error creating media", error);
    res.status(500).json({
      success: false,
      message: "Error creating media",
    });
  }
};

const getAllMedias = async (req, res) => {
  try {
    const result = await Media.find({ userId: req.user.userId });

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Can't find any media for this user",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error fetching medias", error);
    res.status(500).json({
      success: false,
      message: "Error fetching medias",
    });
  }
};

module.exports = { uploadMedia, getAllMedias };
