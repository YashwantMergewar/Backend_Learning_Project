import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { User } from './../models/user.model';
import { Tweet } from '../models/tweet.model';

const createTweet = asyncHandler(async (req, res) => {
    // Step 1: Get the content of the tweet from the request body
    const {content} = req.body;

    if(!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content cannot be empty");
    }

    // Step 2: Create a new tweet object
    const newTweet = await new mongoose.model('Tweet')
    newTweet({
        owner: req.user._id,
        content: content.trim()
    })

    // step 3: Save the tweet to the database
    const savedTweet = await newTweet.Save()

    // Step 4: Return the saved tweet in the response
    return res
    .status(200)
    .json(new ApiResponse(200, savedTweet, "Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // Step 1: Get the user ID from the request parameters
    const userID = req.params.userId
    if (!userID) {
        throw new ApiError(400, "User ID is required");
    }
    // Step 2: Find the user by ID
    const user = await User.findById(userID);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    // Step 3: Find the tweets by user ID
    const userTweets = await Tweet.find({ owner: userID })
    .populate('owner', 'username avatar') 
    .sort({ createdAt: -1 }); 
    // Step 4: Return the tweets in the response
    return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "User tweets retrieved successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    // Step 1: Get the tweet ID from the request parameters
    const tweetID = req.params.tweetID
    // Step 2: Get the content of the tweet from the request body
    const {content} = req.body
    if(!content || content.trim() === ""){
        throw new ApiError(400, "Tweet content cannot be empty");
    }

    // Step 3: Find the tweet by ID
    const tweet = await Tweet.findById(tweetID)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    // Step 4: update the tweet content
    tweet.content = content.trim()
    // Step 5: Save the updated tweet to the database
    const updatedTweet = await tweet.save()

    // Step 6: Return the updated tweet in the response
    return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));

})

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetID = req.params.tweetID
    if (!tweetID) {
        throw new ApiError(400, "Tweet ID is required");
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetID)
    return res
    .status(200)
    .json(new ApiResponse200, deletedTweet, "Tweet deleted successfully")
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}