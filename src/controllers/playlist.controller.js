import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";
import { Video } from "../models/video.model";

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name || name.trim() === ""){
        throw new ApiError(400, "Name should not be empty..! Give any name/title to the playlist")
    }

    const playlist = await Playlist.create({
        name ,
        description
    })

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully...!"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "Give valid user ID")
    }

    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(400, "user not found with this Id")
    }

    const playlist = await Playlist.find({owner: userId})
    .populate('owner', 'username avatar')
    .sort({createdAt: -1})

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Successfully fetched user playlist"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "It is not valid Id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "Playlist not found..!")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully by using id"))
})

const addVideoToPlaylist = asyncHandler(async (req, res)=>{
    const {playlistId, videoId} = req.params

    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "id are not valid..!")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "video not found..!")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "Playlist not found..!")
    }

    if(playlist.videos.include(videoId)){
        throw new ApiError(400, "video is already exists..!")
    }

    playlist.videos.push(videoId)
    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video successfully added to playlist..!"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "id are not valid..!")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "Playlist not found..!")
    }

    playlist.videos = playlist.videos.filter(
        (Id) => {
            Id.toString() !== videoId.toString()
        }
    )
    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video is successfully removed from playlist..!"))
    

})

const deletePlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.params

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Id is not valid")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "Playlist does not exists..!")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(new ApiResponse(200, deletedPlaylist, "Playlist deleted..!"))
})

const updatePlaylist = asyncHandler(async(req, res)=> {
    const {playlistId} = req.params
    const {name, description}= req.body

    if(!name && !description){
        throw new ApiError(400, "Nothing to update here..!")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        name,
        description
    },{new:true})

    if(!updatedPlaylist){
        throw new ApiError(400, "Playlist not found to update")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
})

export{
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}