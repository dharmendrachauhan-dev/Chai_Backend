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
    getUserChannelProfile
} from "../controllers/user.controller.js"

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
router.route("/change-current-password").patch(verifyJWT /*this  middleware */, changeCurrentPassword)
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails)
router.route("/update-user-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-usercover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile) 

export default router