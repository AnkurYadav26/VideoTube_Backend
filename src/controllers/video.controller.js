import mongoose, { isValidObjectId } from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import { Video } from "../models/video.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";



const getallvideo = asynchandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Allowed fields and types
    const allowedSortFields = ["createdAt", "views", "duration", "title"];
    const allowedSortTypes = ["asc", "desc"];

    // Validate sortBy and sortType
    if (!allowedSortFields.includes(sortBy)) sortBy = "createdAt";
    if (!allowedSortTypes.includes(sortType.toLowerCase())) sortType = "desc";

    const filter = {};

    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId && isValidObjectId(userId)) {
        filter.owner = userId;
    }

    filter.ispublished = true;

    const sort = {};
    sort[sortBy] = sortType.toLowerCase() === "asc" ? 1 : -1;

    const options = { page, limit, sort };

    const result = await Video.aggregatePaginate(Video.aggregate([
        { $match: filter },
        { $project: { __v: 0 } }
    ]), options);

    return res.status(200).json(
        new apiresponse(200, result, "Videos fetched successfully")
    );
});
const publishvideo = asynchandler(async (req, res) => {
  const { title } = req.body;

  // ✅ Get file paths from multer
  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  // ✅ Upload files to Cloudinary
  const videoUpload = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoUpload?.url || !thumbnailUpload?.url) {
    throw new ApiError(500, "Error uploading video or thumbnail");
  }

  // ✅ Create video document in DB
  const video = await Video.create({
    videofile: videoUpload.url,
    thumbnail: thumbnailUpload.url,
    title,
    duration: videoUpload.duration || 0,
    videoPublicId: videoUpload.public_id,
    thumbnailPublicId: thumbnailUpload.public_id,
    owner: req.user._id,
    ispublished: true,
  });

  // ✅ Send uniform response
  return res
    .status(201)
    .json(new apiresponse(201, video, "Video published successfully"));
});
const getvideobyid = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id ")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video is not found in db ")
    }
    return res.
        status(200)
        .json(new apiresponse(200, video, "video find Successfully"))

})
const updatevideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found in db");
  }

  // Only owner can update
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this video");
  }

  const { title, description } = req.body;

  // Update title if provided
  if (title) {
    video.title = title;
  }

  // Update description if provided
  if (description) {
    video.description = description;
  }

  // Update thumbnail if provided
  if (req.file?.path) {
    // Delete old thumbnail from Cloudinary if exists
    if (video.thumbnailPublicId) {
      await cloudinary.uploader.destroy(video.thumbnailPublicId, { resource_type: "image" });
    }

    const uploadThumbnail = await uploadOnCloudinary(req.file.path);
    video.thumbnail = uploadThumbnail.url;
    video.thumbnailPublicId = uploadThumbnail.public_id;
  }

  await video.save();

  return res
    .status(200)
    .json(new apiresponse(200, video, "Video updated successfully"));
});
const deletevideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid")
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to publish this video");
    }

    if (video.videoPublicId) {
        await cloudinary.uploader.destroy(video.videoPublicId, { resource_type: "video" });
    }

    if (video.thumbnailPublicId) {
        await cloudinary.uploader.destroy(video.thumbnailPublicId, { resource_type: "image" });
    }

    await Video.findByIdAndDelete(videoId);
    return res
        .status(200)
        .json(new apiresponse(200, null, "Video deleted successfully"));



})
const togglepublishstatus = asynchandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, " Video Id is invalid ")
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to publish this video");
    }
    video.ispublished = !video.ispublished;
    await video.save();

    return res.status(200).json(
        new apiresponse(
            200,
            video.ispublished,
            `Video is now ${video.ispublished ? "published" : "unpublished"}`
        )
    );
})



export {
    getallvideo,
    publishvideo,
    getvideobyid,
    updatevideo,
    deletevideo,
    togglepublishstatus
}