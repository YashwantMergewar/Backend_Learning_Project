import { Router } from "express";
import { loginUser, logOutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
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

export default router;