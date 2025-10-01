import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/apierror.js"
import {apiresponse} from "../utils/apiresponse.js"
import {asynchandler} from "../utils/asynchandler.js"

const getchannelstats = asynchandler(async (req, res) => {
        const { channelId } = req.params;

    if (!channelId || !mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Total videos uploaded by channel
    const totalVideos = await Video.countDocuments({ owner: channelId });

    // Total views across all videos
    const videosList = await Video.find({ owner: channelId }).select("views _id");
    const totalViews = videosList.reduce((sum, video) => sum + (video.views || 0), 0);

    // Total likes across all videos
    const videoIds = videosList.map(v => v._id);
    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

    // Total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    return res.status(200).json(new apiresponse(200, {
        totalVideos,
        totalViews,
        totalLikes,
        totalSubscribers
    }, "Channel stats fetched successfully"));
});


const getchannelvideos = asynchandler(async (req, res) => {
   const { channelId } = req.params;

    if (!channelId || !mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const videos = await Video.find({ owner: channelId })
        .select("title videofile thumbnail duration views ispublished createdAt")
        .sort({ createdAt: -1 }); // latest first

    return res.status(200).json(new apiresponse(200, { videos }, "Channel videos fetched successfully"));
})
export {
    getchannelstats, 
    getchannelvideos
    }