import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';
import { deleteImage } from "../utils/deleteImage.js";

// Creating method for access and refresh token
const generateAccessAndRefreshToken =async (userId) => {
    try {
        const user = await User.findById(userId)
        
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        // Here we have taken access and refresh token from the user model
        // now we have to save the refresh token in the database
        // and return the access token and refresh token
        
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false}) // we are not validating the user before saving the refresh token (not asking for password again)

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Error while generating access and refresh token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Registration logic here
    // Steps to register a user:
    
        // Step 1: Get the user data/details from frontend
        // Step 2: Validate (not empty) the user data
        // Step 3: Check if the user already exists in the database : username or email
        // Step 4: check for image and avatar
        // Step 5: upload them to cloudinary, avatar
        // Step 6: Create a user object - create entry in the DB
        // Srep 7: Remove password and refresh token from the response
        // Step 8: Check for user creation
        // Step 9: Return Response

    const {fullName, email, username, password} = req.body
    
    

    // Therer is a simple way to validate the data
    /*if (!fullName || !email || !username || !password) {
        throw new ApiError(400, "All fields are required");
    }*/
    
    // Here we are using expert level validation syntax
    if (
        [fullName, email, username, password].some((field) => field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    } 

    // Check if the user already exists in the database
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })
    // console.log("Existed User: ", existedUser);
    

    if (existedUser){
        throw new ApiError(409, "User already exists with this username or email");
    }

    // console.log(req.files);
    

    // check for image and avatar
    // multer gives us the files access through req.files
    // it might be or might not be present the files thats why we chain the optional chaining operator
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;        
    }

    // console.log("Avatar Local Path: ", avatarLocalPath);
    // console.log("Cover Image Local Path: ", coverImageLocalPath);

    if (!avatarLocalPath || !coverImageLocalPath) {
        throw new ApiError(400, "Avatar and Cover Image are required");
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // console.log("Avatar: ", avatar);
    // console.log("Cover Image: ", coverImage);
    

    if (!avatarLocalPath || !coverImageLocalPath) {
        return res.status(500).json({
            success: false,
            message: "File upload failed",
        });
    }

    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // coverImage is optional, so we can set it to an empty string if not provided
    });
    // console.log("Before save: ", user.password);
    // await user.save() // this will save the user in the database
    // console.log("after save: ", user.password);
    

    // we can do it by undefining the password and refreshToken fields
    // user.password = undefined;
    // user.refreshToken = undefined;

    // advance step: Remove password and refresh token from the response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");// Remove password and refresh token from the response
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong, while creating user");
    }

    // return Response
    res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res)=> {
    // Login TODOS
    // Step 1: Get the user data from frontend
    // Step 2: Validate the user data
    // Step 3: Check if user exists in the database if not throw error
    // Step 4: Check if the password is correct
    // Step 5: Generate access token and refresh token
    // Step 6: Update the refresh token in the database
    // Step 7: Send cookies

    // Step 1: Get the user data from frontend
    const {username, email, password} = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or Email are required");
    }

    //Step 2: Validate the user data
    // this is a mongoDB query to find a user by username or email
    // finedOne is a method provided by mongoose to find a single document in the database which matches first argument
    // $or is a mongoDB operator
    const user = await User.findOne({
        $or: [{username}, {email}]
    }).select('+password +refreshToken'); // select the password and refreshToken fields to check them later

    //Step 3: Check if user exists in the database if not throw error
    if (!user) {
        throw new ApiError(404, "User not found with this username or email");
    }


    // Step 4: Check if the password is correct
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    // Step 5: Generate access token and refresh token
    // This generateAccessAndRefreshToken method returning access and refresh token and we simply destructuring it like req.body
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    // Now we have reference of user in the database of these outerscope user which is empty
    // so we again take database call for user to get the user details without password and refresh token
    const loggedInUser = await User.findById(user._id).select("-password -refereshToken");
    // Now loggedInUser have all the user details except password and refresh token
    // and also we have access token and refresh token of the user separately

    //Step 7: Send cookies
    const options = {
        httpOnly: true, // this means the cookie is not accessible from client side JavaScript
        secure: true, // this means the cookie is only sent over HTTPS
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, 
            {
                user: loggedInUser, // this is the user object without password and refresh token
                accessToken, // this is the access token
                refreshToken // this is the refresh token
            }
            , "User logged in successfully")
    )

})

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: undefined}
        },
        {
            new: true // this will return the updated user
        }
    )

    const options = {
        httpOnly: true, // this means the cookie is not accessible from client side JavaScript
        secure: true, // this means the cookie is only sent over HTTPS
    }

    return res
    .status(200)
    .clearCookie("accessToken", options) // clear the access token cookie
    .clearCookie("refreshToken", options) // clear the refresh token cookie
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // Step 1: Get the refresh token from cookies
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    // Step 2: Validate the refresh token
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request: Refresh token is required");
    }

    // Step 3: Decode the refresh token
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Step 4: Find the user by ID from the decoded token
    const user = await User.findById(decodedToken?._id)

    // Step 5: Check if the user exists or not
    if (!user) {
        throw new ApiError(401, "Invalid refresh token: User not found");
    }

    // Step 6: Check if the refresh token in the database matches the incoming refresh token
    if(user?.refreshToken !== incomingRefreshToken){
        throw new ApiError(401, "Refresh token is expired or invalid");
    }

    const options = {
        httpOnly: true, // this means the cookie is not accessible from client side JavaScript
        secure: true, // this means the cookie is only sent over HTTPS
    }

    // Step 7: Generate new access and refresh tokens
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)

    // Step 8: Update the refresh token in the database

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token refreshed successfully"))


})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // Step1: Get the user password from the request body
    const {oldPassword, newPassword} = req.body;

    // Step2: get the user from the request object
    const user = await User.findById(req.user?._id)

    // Step3: Check if old password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect");
    }

    // Step4: Update the password in the user object(database)
    user.password = newPassword
    await user.save({validateBeforeSave: false}) // we are not validating the user before saving the password (not asking for old password again)

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    // Step1: Get the user details from the request body
    const {fullName, email} = req.body;

    // Step2: Check if this fields are not empty
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    } 

    // Step3: Get the user from the request object
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email.toLowerCase() // email should be in lowercase
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    // Step1: Get the avatar from the request files
    const avatarLocalPath = req.file?.path

    // Step2: Check if the avatar is not empty
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // Step3: Upload the avatar to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
        
    if(!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true} // new: true means return the updated user object
    ).select("-password")

    const oldAvatar = req.user?.avatar || ""; // Get the old avatar URL to delete it from cloudinary later
    if(!oldAvatar){
        throw new ApiError(400, "Old avatar not found");
    }
    // Delete the old avatar from cloudinary
    deleteImage(oldAvatar) // This will delete the old avatar from cloudinary

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"))
})

const updateUsercoverImage = asyncHandler(async (req, res) => {
    // Step1: Get the coverImage from the request files
    const coverLocalPath = req.file?.path

    // Step2: Check if the avatar is not empty
    if (!coverLocalPath) {
        throw new ApiError(400, "coverImage is required");
    }

    // Step3: Upload the avatar to cloudinary
    const coverImage = await uploadOnCloudinary(coverLocalPath)
        
    if(!coverImage.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    const oldCoverImage = req.user?.coverImage || ""; // Get the old cover image URL to delete it from cloudinary later
    if(!oldCoverImage){
        throw new ApiError(400, "Old cover image not found");
    }
    // Delete the old cover image from cloudinary
    deleteImage(oldCoverImage) // This will delete the old cover image from cloudinary

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"))
})



export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverImage
};