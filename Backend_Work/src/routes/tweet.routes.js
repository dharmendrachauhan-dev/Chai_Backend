import {Router} from "express"
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet
} from "../controllers/tweet.controller.js"

// Middlewares
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

// Tweets Routes APIs
router.route("/").post(verifyJWT, createTweet)
router.route("/u/:username").get(getUserTweets)  // recheck
router.route("/:tweetId").patch(verifyJWT, updateTweet)
router.route("/:tweetId").delete(verifyJWT, deleteTweet)

export default router