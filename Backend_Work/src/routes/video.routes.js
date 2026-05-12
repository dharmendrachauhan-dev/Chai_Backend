import {Router} from "express"
import { getAllVideos, publicAVideos } from "../controllers/video.controller"
import { verifyJWT } from "../middleware/auth.middleware"

const router = Router()

router.route("/video").post(
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
router.route("/:videoId").get(verifyJWT , getVideoById)
router.route("/:videoId").patch(verifyJWT, upload.single(thumbnail), updateVideo)
router.route("/:videoId").delete(verifyJWT, deleteVideo)
router.route("/:videoId").patch(verifyJWT. togglePublishStatus)