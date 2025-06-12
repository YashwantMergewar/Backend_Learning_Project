import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    console.log("Email: ", email);
    console.log("Username: ", username);

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
    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })
    console.log("Existed User: ", existedUser);
    

    if (existedUser){
        throw new ApiError(409, "User already exists with this username or email");
    }

    // check for image and avatar
    // multer gives us the files access through req.files
    // it might be or might not be present the files thats why we chain the optional chaining operator
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath || !coverImageLocalPath) {
        throw new ApiError(400, "Avatar and Cover Image are required");
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatarLocalPath || !coverImageLocalPath) {
        throw new ApiError(400, "Avatar and Cover Image are required");
    }

    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage.url
    })

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

export {registerUser};