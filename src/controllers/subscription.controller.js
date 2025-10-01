import { isValidObjectId } from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { apiresponse } from "../utils/apiresponse.js";
import { ApiError } from "../utils/apierror.js";
import {Subscription} from "../models/subscription.models.js"
import {User} from "../models/user.models.js"

const togglesubscription = asynchandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;
   if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const channel = await User.findById(channelId);
    if (!channel) throw new ApiError(404, "Channel not found");
    const existingSub = await Subscription.findOne({ channel: channelId, subscriber: userId });
    if (existingSub) {
        await existingSub.deleteOne();
        const totalSubs = await Subscription.countDocuments({ channel: channelId });
        return res.status(200).json(new apiresponse(200, { subscribers: totalSubs }, "Unsubscribed"));
    } else {
        await Subscription.create({ channel: channelId, subscriber: userId });
        const totalSubs = await Subscription.countDocuments({ channel: channelId });
        return res.status(200).json(new apiresponse(200, { subscribers: totalSubs }, "Subscribed"));
    }
})
const getuserchannelsubscribers = asynchandler(async (req, res) => {
    const {channelId} = req.params
    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate({ path: "subscriber", select: "name email avatar" })
        .sort({ createdAt: -1 });

    return res.status(200).json(new apiresponse(200, { subscribers }, "Subscribers fetched successfully"));
})

const getsubscribedchannels = asynchandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!subscriberId || !isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const channels = await Subscription.find({ subscriber: subscriberId })
        .populate({ path: "channel", select: "name email avatar" })
        .sort({ createdAt: -1 });

    return res.status(200).json(new apiresponse(200, { channels }, "Subscribed channels fetched successfully"));
})

export {
    togglesubscription,
    getuserchannelsubscribers,
    getsubscribedchannels
}