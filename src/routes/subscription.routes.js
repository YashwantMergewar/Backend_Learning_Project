import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
    getSubscribedChannels, 
    getUserChannelSubscribers, 
    toggleSubscription 
} from "../controllers/subscription.controller.js";


const router = Router()
router.use(verifyJWT)
router.route("/c/:channelId").get(getSubscribedChannels).post(toggleSubscription)
router.route("/u/:subscriberId").get(getUserChannelSubscribers)

export default router;