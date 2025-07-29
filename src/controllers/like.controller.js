import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from './../models/tweet.model.js';

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user._id
    
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "This is not valid id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "Video is found or exists..!")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    let message = ""

    if(existingLike){
        await existingLike.deleteOne()
        message = "Video unlike successfully"
    }else{
        await existingLike.create({
            video: videoId,
            likedBy: userId
        })
        message = "Video Liked successfully"
    }

    return res
    .status(200)
    .json(new ApiResponse(200, null, message))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id

    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "It is not valid Id")
    }

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400, "comment is not found")
    }

    const existingComment = await Comment.findOne({
        comment: commentId,
        likedBy: userId
    })
    let message = ""

    if(existingComment){
        await existingComment.deleteOne({
            comment: commentId,
            likedBy: userId
        })
        message = "Comment is unliked successfully"
    }else{
        await existingComment.create({
            comment: commentId,
            likedBy: userId
        })
        message = "Comment is liked successfully"
    }

    await existingComment.save()

    return res
    .status(200)
    .json(new ApiResponse(200, null,  message))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const {userId} = req.user._id

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "It is not valid Id")
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(400, "This tweet is not found")
    }

    const existingTweet = await Tweet.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    let message = ""
    if(existingTweet){
        await existingTweet.deleteOne({
            tweet: tweetId,
            likedBy: userId
        })
        message = "Tweet is unlike successfully"
    }else{
        await existingTweet.create({
            tweet: tweetId,
            likedBy: userId
        })
        message = "Tweet is liked successfully"
    }

    await existingTweet.save()
    return res
    .status(200)
    .json(new ApiResponse(200, null, message))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const likes = await Like.find({
        likedBy: userId
    }).populate('watchHistory')

    const eachLikeVideo = likes.map(like => like.video)

    return res
    .status(200)
    .json(new ApiResponse(200, {count: eachLikeVideo.length, videos: eachLikeVideo}, "successfully fetch liked videos"))
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos

}