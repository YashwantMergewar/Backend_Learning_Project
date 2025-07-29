import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user._id

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400, "It is not valid id")
    }

    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(400, "User doesn't exists..!")
    }

    const existingSubsciption= await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })
    let message = ""

    if(existingSubsciption){
        await Subscription.findByIdAndDelete({
            subscriber: userId,
            channel: channelId
        })
        message = "Channel is unsubscribe successfully..!"
    }else{
        await Subscription.create({
            subscriber: userId,
            channel: channelId
        })
        message = "Successfully subscribe the Channel..!"
    }
    

    return res
    .status(200)
    .json(new ApiResponse(200, null, message))
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const subscriberList = await Subscription.find({channel: channelId}).populate('subscriber')
    if(!subscriberList){
        throw new ApiError(400, "subscribers not found here..!")
    }

    const subList = subscriberList.map(sub => sub.subscriber)

    return res
    .status(200)
    .json(new ApiResponse(200, {count:subscriberList.length, data: subList}, "Subscribers found"))
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params

    const subscribedChannels = await Subscription.find({subscriber: subscriberId}).populate('channel')

    const channelList = subscribedChannels.map(sub => sub.channel)

    return res
    .status(200)
    .json(new ApiResponse(200, {count: subscribedChannels.length, data: channelList}, "Subscribed channels found"))
})


export{
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}