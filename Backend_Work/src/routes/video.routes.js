import {Router} from "express"
import { publicAVideos } from "../controllers/video.controller"

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