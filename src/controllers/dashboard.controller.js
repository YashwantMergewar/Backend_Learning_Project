import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { Video } from "../models/video.model";
import { ApiResponse } from "../utils/ApiResponse";

const getChannelStates = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    // Step 1: Get the user access first
    const user = req.user._id

    if(!mongoose.isValidObjectId(user)) {
        throw new ApiError(400, "Invalid user ID");
    }

    // Step 2:  Get the total number of videos uploaded by the user
    const videos = await Video.find({ owner: user})
    const totalVideos = videos.length;

    // Step 3: Get the total views of all videos
    const totalViews = videos.reduce((acc, videos) => {
        return acc + videos.views;
    }, 0);

    // Step 4: Get the total subscribers of the user
    const totalSubscribers = await mongoose.model("Subscription").countDocuments({ channel: user })
    if (totalSubscribers === null) {
        throw new ApiError(404, "No subscribers found for this channel");
    }

    // Step 5: Get the total likes of all videos
    const videoIds = videos.map(video => video._id)
    const totalLike = await mongoose.model("Like").countDocuments(
        {
            video: {
                $in: videoIds
            }
        }
    )

    // Step 6: Return the channel states through the response
    return res
    .status(200)
    .json(new ApiResponse(200, {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLike
    }, "Channel states fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // Getting all videos of a channel
    
    // Step 1: Get the channelId from the req.params
    const {channelId} = req.params
    // Step 2: Validate the channelId
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    // Step 3: Fetch videos from the database
    const allVideos = await Video.findById({ owner: channelId})
    .populate("owner", "username avatar")
    .createdAt(-1) 
    // Step 4: Check if videos exist
    if (!allVideos || allVideos.length === 0) {
        throw new ApiError(404, "No videos found for this channel");
    }
    // Step 5: Return the videos in the response
    return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "Videos fetched successfully"))
})

export {
    getChannelStates,
    getChannelVideos
}