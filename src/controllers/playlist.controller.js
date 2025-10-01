import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/apierror.js"
import { apiresponse } from "../utils/apiresponse.js"
import { User } from "../models/user.models.js"
import { Playlist } from "../models/playlist.models.js"
import { Video } from "../models/video.models.js"

const createplaylist = asynchandler(async (req, res) => {
    const { name, description } = req.body
    if (!name || !description) {
        throw new ApiError(400, "provide both information Name and description ")
    }
    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(400, "user not found ")
    }
    const newplayplaylist = await Playlist.create({
        name: name,
        description: description,
        videos: [],
        owner: user._id
    })

    return res
        .status(201)
        .json(new apiresponse(200, newplayplaylist, "playlist Created successfully"))
})
const getuserplaylists = asynchandler(async (req, res) => {
    const { userId } = req.params
    if (!userId) {
        throw new ApiError(401, "user Id not found ")
    }
    const playlist = await Playlist.find({ owner: userId });
    if (!playlist) {
        throw new ApiError(400, "Playlist not found ")
    }
    return res
        .status(200)
        .json(new apiresponse(200, playlist, "playlist found successfully"))
})
const getplaylistbyid = asynchandler(async (req, res) => {
    const { playlistid } = req.params
    //TODO: get playlist by id
    if (!playlistid) {
        throw new ApiError(400, "playlist id  not found ")
    }
    const playlist = await Playlist.findById(playlistid)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    return res
        .status(200)
        .json(new apiresponse(200, playlist, "Playlist fetched successfully"));
})
const addvideotoplaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist Id and video id both are required");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(400, "Playlist not found");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "Video not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist");
    }

    // Ensure videos array exists
    if (!Array.isArray(playlist.videos)) {
        playlist.videos = [];
    }
     if (playlist.videos.includes(videoId)) {
        return res
            .status(400)
            .json(new apiresponse(400, playlist, "Video is already in the playlist"));
    }
    else{
        playlist.videos.push(videoId);
        await playlist.save();
    }

    // ✅ Return updated playlist as response
    const updatedPlaylist = await Playlist.findById(playlistId)
        .populate("videos", "title thumbnail")
        .populate("owner", "username");

    return res
        .status(200)
        .json(new apiresponse(200, updatedPlaylist, "Video added to playlist successfully"));
});
const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist Id and video id both are required")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found ")
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist");
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found ")
    }

    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video is not in this playlist");
    }
    playlist.videos = playlist.videos.filter(
        (vid) => vid.toString() !== videoId.toString()
    )
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlistId)
        .populate("videos", "title thumbnail")
        .populate("owner", "username");

    return res
        .status(200)
        .json(new apiresponse(200, updatedPlaylist, "Video remove from playlist successfully"))
})
const deletePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!playlistId) {
        throw new ApiError(400, "Playlist Id is required")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist");
    }
    await playlist.deleteOne();
    return res
        .status(200)
        .json(new apiresponse(200, {}, "Playlist deleted successfully"));
})
const updatePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if (!playlistId) {
        throw new ApiError(400, "playlist id required")
    }
    if (!name && !description) {
        throw new ApiError(400, "any change is require either namee or description")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(400, "playlist not found")
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist");
    }
    if (name) playlist.name = name;
    if (description) playlist.description = description;
    await playlist.save();


    return res
        .status(200)
        .json(new apiresponse(200, playlist, "playlist Updated successfully "))
})

export {
    createplaylist,
    getuserplaylists,
    getplaylistbyid,
    addvideotoplaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}