import { isValidObjectId } from "mongoose"
import { asynchandler } from "../utils/asynchandler.js"
import { apiresponse } from "../utils/apiresponse.js"
import { ApiError } from "../utils/apierror.js"
import { Comment } from "../models/comment.models.js"
import { Video } from "../models/video.models.js"

const getvideocomments = asynchandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const video = await Video.findById(videoId);
if (!video) throw new ApiError(404, "Video not found");

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const comments = await Comment.find({ video: videoId })
        .populate("owner", "username avatar") // optional
        .sort({ createdAt: -1 }) // latest first
        .skip(skip)
        .limit(parseInt(limit));
    const totalComments = await Comment.countDocuments({ video: videoId });
    return res
        .status(200)
        .json(new apiresponse(200, {
            comments,
            pagination: {
                total: totalComments,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalComments / parseInt(limit)),
            },
        }, "Comments fetched successfully"));
})
const addcomment = asynchandler(async (req, res) => {
    const { comment } = req.body
    const { videoId } = req.params;
    if (!comment || comment.trim() === "") {
        throw new ApiError(400, "Empty comment is not valid");
    }
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const video = await Video.findById(videoId);
if (!video) throw new ApiError(404, "Video not found");

    const newcomment = await Comment.create({
        content: comment,
        video: videoId,
        owner: req.user._id,
    });

    return res
        .status(201)
        .json(new apiresponse(201, newcomment, "comment created successfully"))
})
const updatecomment = asynchandler(async (req, res) => {
    const { comment } = req.body
    const { commentId } = req.params;
    if (!comment || comment.trim() === "") {
        throw new ApiError(400, "Updated comment cannot be empty");
    }
    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    const existingComment = await Comment.findById(commentId);
    if (!existingComment) {
        throw new ApiError(404, "Comment not found");
    }
    if (existingComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }
    existingComment.content = comment;
    await existingComment.save();
    return res
        .status(200)
        .json(new apiresponse(200, existingComment, "Comment updated successfully"));
});
const deletecomment = asynchandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    const existingComment = await Comment.findById(commentId);
    if (!existingComment) {
        throw new ApiError(404, "Comment not found");
    }
    if (existingComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }
    await existingComment.deleteOne()

    return res
        .status(200)
        .json(new apiresponse(200, {}, "Comment deleted successfully"));
});
export { getvideocomments, addcomment, updatecomment, deletecomment };