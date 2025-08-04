import { Router } from "express";
import {
    getChannelStates,
    getChannelVideos
} from "../controllers/dashboard.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router()
router.use(verifyJWT)
router.route("/states").get(getChannelStates);
router.route("/videos/:channelId").get(getChannelVideos);

export default router;