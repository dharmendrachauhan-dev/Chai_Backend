import { Router } from "express";
import {
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike
} from "../controllers/like.controller.js";

// Middelwares
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()


// Routes
router.route("/toggle/v/:videoId").patch(verifyJWT, toggleVideoLike)
router.route("/toggle/c/:commentId").patch(verifyJWT, toggleCommentLike)
router.route("/toggle/t/:tweetId").patch(verifyJWT, toggleTweetLike)
router.route("/videos").get(verifyJWT, getLikedVideos)


export default router