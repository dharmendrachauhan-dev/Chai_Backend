import { Router } from "express"
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription
} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"


const router = Router()


router.route("/toggle/:channelId").patch(verifyJWT, toggleSubscription)
router.route("/u/:channelId").get(verifyJWT, getUserChannelSubscribers)
router.route("/s/:channelId").get(verifyJWT, getSubscribedChannels)

export default router