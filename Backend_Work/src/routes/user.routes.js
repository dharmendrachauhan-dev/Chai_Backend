import { Router } from "express"
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getCurrentUser,
    getWatchHistory
} from "../controllers/user.controller.js"

// Tweets
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet
} from "../controllers/tweet.controller.js"

// Middlewares
import { upload } from '../middleware/multer.middleware.js'
import { verifyJWT } from "../middleware/auth.middleware.js"


const router = Router()

router.route("/register").post(
    //This is our middleware
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        },
    ]),
    registerUser
)


router.route("/login").post(loginUser)

// Secured Routes
router.route("/logout").post(verifyJWT /*this  middleware */, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").patch(verifyJWT /*this  middleware */, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-details").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)


// Tweets Routes APIs
router.route("/create-tweet").post(verifyJWT, createTweet)
router.route("/t/:username").get(getUserTweets)  // recheck
router.route("/update-tweet/:tweetId").patch(verifyJWT, updateTweet)
router.route("/delete-tweet/:tweetId").delete(verifyJWT, deleteTweet)

export default router