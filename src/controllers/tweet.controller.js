import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/apierror.js"
import { apiresponse } from "../utils/apiresponse.js"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"

const createtweet = asynchandler(async (req, res) => {
    const { tweet } = req.body ;

    if (!tweet || tweet.trim() === "") {
        throw new ApiError(400, "Pls enter tweet data");
    }

    const user = await User.findById(req.user._id)

    if (!user) {
        throw new ApiError(404, "user not found ")
    }

    const newtweet = await Tweet.create({
        content: tweet,
        owner: user._id
    })
    return res
        .status(201)
        .json(new apiresponse(201, newtweet, "Tweet created successfully"));

});
const getusertweets = asynchandler(async (req, res) => {
    const userId = req.user._id
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new apiresponse(200, tweets, "User tweets fetched successfully"));
});
const updatetweet = asynchandler(async (req, res) => {
    const { id } = req.params;       // tweetId from URL
    const { tweet } = req.body;      // new tweet content

    // 1. Validate new content
    if (!tweet || tweet.trim() === "") {
        throw new ApiError(400, "Tweet content cannot be empty");
    }

    // 2. Find tweet
    const existingTweet = await Tweet.findById(id);
    if (!existingTweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // 3. Check ownership
    if (existingTweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    // 4. Update tweet
    existingTweet.content = tweet;
    await existingTweet.save();

    // 5. Respond
    return res
        .status(200)
        .json(new apiresponse(200, existingTweet, "Tweet updated successfully"));
});
const deletetweet = asynchandler(async (req, res) => {
    const { id } = req.params;   // tweetId from URL

    // 1. Find tweet
    const tweet = await Tweet.findById(id);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // 2. Check ownership
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    // 3. Delete tweet
    await tweet.deleteOne();

    // 4. Respond
    return res
        .status(200)
        .json(new apiresponse(200, {}, "Tweet deleted successfully"));
});

export { createtweet, getusertweets, updatetweet, deletetweet };