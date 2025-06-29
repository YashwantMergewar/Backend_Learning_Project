import { Router } from "express";
import { 
    loginUser, logOutUser, registerUser, refreshAccessToken, changeCurrentPassword, 
    getCurrentUser, updateAccountDetails, updateUserAvatar, updateUsercoverImage, 
    getUserChannelProfile, getWatchHistory 
} from "../controllers/user.controller.js";
import { upload } from './../middleware/multer.middleware.js';
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();

router.route("/register").post(
    // Use multer middleware to handle file uploads
    // The upload middleware will handle the file uploads for "avatar" and "coverImage"
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

router.route("/login").post(loginUser)

// secured route
router.route("/logout").post(verifyJWT, logOutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateUsercoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile); // here c is for channel

router.route("/watchHistory").get(verifyJWT, getWatchHistory);

export default router;