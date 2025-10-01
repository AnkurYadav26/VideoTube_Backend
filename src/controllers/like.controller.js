import { isValidObjectId } from "mongoose"
import { asynchandler } from "../utils/asynchandler.js"
import { apiresponse } from "../utils/apiresponse.js"
import { ApiError } from "../utils/apierror.js"
import { Like } from "../models/like.models.js"
import { Video } from "../models/video.models.js"
import {Tweet} from "../models/tweet.models.js"
import { Comment } from "../models/comment.models.js"

const togglevideolike = asynchandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id
    //TODO: toggle like on video
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }


    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")

    const existingLike = await Like.findOne({ video: videoId, likedby: userId })

    if (existingLike) {
        // 4️⃣ If already liked, remove the like
        await existingLike.deleteOne()
        const totalLikes = await Like.countDocuments({ video: videoId })
        return res.status(200).json(new apiresponse(200, { likes: totalLikes }, "Like removed"))
    }
    else {
        // 5️⃣ If not liked yet, create a new like
        await Like.create({ video: videoId, likedby: userId })
        const totalLikes = await Like.countDocuments({ video: videoId })
        return res.status(200).json(new apiresponse(200, { likes: totalLikes }, "Video liked"))
    }

})
const togglecommentlike = asynchandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user._id

    if(!commentId || !isValidObjectId(commentId)){
          throw new ApiError(400,"Invalid Comment ID ")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError (400,"Comment not find ")
    }

     const existingLike = await Like.findOne({ comment: commentId, likedby: userId })

    if (existingLike) {
        await existingLike.deleteOne()
        const totalLikes = await Like.countDocuments({ comment: commentId })
        return res.status(200).json(new apiresponse(200, { likes: totalLikes }, "Like removed"))
    }
    else{
        await Like.create({ comment: commentId, likedby: userId })
        const totalLikes = await Like.countDocuments({ comment: commentId })
        return res.status(200).json(new apiresponse(200, { likes: totalLikes }, "comment liked"))
    }
    })
const toggletweetlike = asynchandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user._id


    if(!tweetId || !isValidObjectId(tweetId)){
          throw new ApiError(400,"Invalid tweet ID ")
    }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError (400,"tweet not find ")
    }

     const existingLike = await Like.findOne({ tweet: tweetId, likedby: userId })

    if (existingLike) {
        await existingLike.deleteOne()
        const totalLikes = await Like.countDocuments({ tweet: tweetId })
        return res.status(200).json(new apiresponse(200, { likes: totalLikes }, "Like removed"))
    }
    else{
        await Like.create({ tweet: tweetId, likedby: userId })
        const totalLikes = await Like.countDocuments({ tweet: tweetId})
        return res.status(200).json(new apiresponse(200, { likes: totalLikes }, "tweet liked"))
    }
    
}
)
const getlikedvideos = asynchandler(async (req, res) => {
    const userId = req.user._id

    // 1️⃣ Find all likes by this user for videos
    const likes = await Like.find({ likedby: userId, video: { $ne: null } })
        .populate({
            path: "video",
            select: "title description url likes createdAt", // fields you want
        })
        .sort({ createdAt: -1 }) // latest liked first

    // 2️⃣ Extract only the video objects
    const likedVideos = likes.map(like => like.video).filter(v => v != null)

    return res.status(200).json(new apiresponse(200, { likedVideos }, "Liked videos fetched successfully"))

})
export {
    togglevideolike,
    togglecommentlike,
    toggletweetlike,
    getlikedvideos
}