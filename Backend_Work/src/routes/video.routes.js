import { Router } from "express"
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publicAVideos,
    togglePublishStatus,
    updateVideo
} from "../controllers/video.controller.js"

import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

router.route("/video").post(
    verifyJWT,
    upload.fields([
        {
            name: "thumbnail",
            maxCount: 1
        },
        {
            name: "videoFile",
            maxCount: 1
        }
    ]),
    publicAVideos
)

router.route("/").get(getAllVideos)
router.route("/:videoId").get(verifyJWT, getVideoById)
router.route("/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateVideo)
router.route("/:videoId").delete(verifyJWT, deleteVideo)
router.route("/toggle/:videoId").patch(verifyJWT, togglePublishStatus)

export default router