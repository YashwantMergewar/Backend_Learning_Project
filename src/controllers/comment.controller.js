import mongoose from "mongoose";
import { Comment } from './../models/comment.model.js';
import  { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    // Getting all video comments

    // Step 1: Get the videoId from the req.params
    const { videoId } = req.params;
    const { page=1, limit=10 } = req.query;

    // Step 2: Validate the videoId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Step 3: Fetch comments from the database
    const pageNum = parseInt(page)
    const pageLimit = parseInt(limit)
    const comments = await Comment.find({ video: videoId})
    .skip((pageNum - 1) * pageLimit)
    .limit(pageLimit)
    .populate("owner", "username avatar")

    // Step 4: Check if comments exist
    if (!comments || comments.length === 0) {
        throw new ApiError(404, "No comments found for this video");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    //adding a comment to a video

    // Step 1: Get the videoId and comment text from the request body
    const {content} = req.body
    const { videoId } = req.params;
    // Step 2: Validate the videoId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    // Step 3: check if the video exists
    const videoIsExist = await Video.findById(videoId)
    if (!videoIsExist) {
        throw new ApiError(404, "Video not found");
    }
    // Step 4: Create a new comment
    const newComment = new Comment({
        user: req.user._id,
        video: videoId,
        content: content
    })
    // Step 5: Save the comment to the database
    const savedComment = await newComment.save();
    // Step 6: Return the comment in the response 
    return res
    .status(200)
    .json(new ApiResponse(200, savedComment, "Comment Added Successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    //Step 1: Get the commentId and updated comment text from the request body
    const { content } = req.body;
    const { commentId } = req.params;

    // Step 2: Check if the commentId is provided
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required");
    }

    // Step 2: Validate the commentId
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Step 3: Check if the comment not empty
    if (!content || content.trim() === ""){
        throw new ApiError(400, "Comment cannot be empty");
    }

    // Step 4: Update the comment in the database
    const updatedComment = await Comment.findByIdAndUpdate(commentId, { content }, { new: true})

    // Step 5: Return the updated comment in the response
    if (!updatedComment) {
        throw new ApiError(404, "Comment not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment Updated Successfully"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // Step 1: Get commentId from the request body
    const {commentId} = req.params;

    // Step 2: Check if the commentId is provided
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required");
    }

    // Step 2: Validate the commentId
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Step 3: Check if the comment exists
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Step 4: Delete the comment from the database
    const deletedComment = await Comment.findByIdAndDelete(commentId)
    
    // Step 5: Return the deleted comment in the response
    return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "Comment Deleted Successfully"))

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}