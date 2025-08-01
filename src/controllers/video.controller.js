import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    let {page=1, limit=10, query, sortBy, sortType} = req.query

    page = parseInt(page)
    limit = parseInt(limit)

    sortType = sortType === 'asc' ? 1 : -1
    const sortConfig = sortBy? {[sortBy] : sortType} : {createdAt: -1} 

    const userId = req.user?._id

    if(!userId){
        throw new ApiError(400, "User ID is not found")
    }

    const videos = await Video.find({owner: userId})
    .populate("owner", "username avatar")
    .sort(sortConfig)
    .skip((page-1)*limit)
    .limit(limit)

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "All videos are fetched successfully"))

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoFile = req.files?.videoFile?.[0]
    const thumbnail = req.files?.thumbnail?.[0]
    if(!videoFile){
        throw new ApiError(400, "Video file is required")
    }
    if(!thumbnail){
        throw new ApiError(400, "Thumbnail is required")
    }

    const videoOnCloudinary = await uploadOnCloudinary(videoFile.path)
    const thumbnailOnCloudinary = await uploadOnCloudinary(thumbnail.path)
    
    if(!videoOnCloudinary){
        throw new ApiError(500, "Video upload failed")
    }
    if(!thumbnailOnCloudinary){
        throw new ApiError(500, "Thumbnail upload failed")
    }

    const newVideo = await Video.create({
        title: title,
        description: description,
        videoFile: videoOnCloudinary.url,
        thumbnail: thumbnailOnCloudinary.url,
        duration: videoOnCloudinary.duration,
        owner: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, newVideo, "Video is published successfully"))


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(400, "Video ID not found")
    }

    const accessedVideo = await Video.findById(videoId).populate("owner", "username avatar")

    return res
    .status(200)
    .json(new ApiResponse(200, accessedVideo, "Video is Successfully accessed by ID"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description}= req.body
    const {thumbnail} = req.file

    if(!videoId){
        throw new ApiError(400, "Video Id not found")
    }

    const video = await Video.findById(videoId)

    if(title && description){
        video.title = title
        video.description = description
    }

    if(thumbnail){
        const uploadedThumbnail = await uploadOnCloudinary(thumbnail.path)
        video.thumbnail = uploadedThumbnail.secure_url
    }

    const uploadedVideo = await video.save()

    return res
    .status(200)
    .json(new ApiResponse(200, uploadedVideo, "Video updated successfully"))


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "It is not valid object id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "Video not found")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "It is not valid object ID")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400, "Video is not found")
    }

    video.isPublished = !video.isPublished

    const savedVideo = await video.save()

    return res
    .status(200)
    .json(new ApiResponse(200, savedVideo, "Video is toggled"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus

}