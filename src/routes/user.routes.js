import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from './../middleware/multer.middleware.js';

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


export default router;