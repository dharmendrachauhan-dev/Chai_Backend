import { Router } from "express";
import { createPlaylist } from "../controllers/playlist.controller";


const router = Router()

//middleware
import { verifyJWT } from "../middleware/auth.middleware";


router.route("/").post("verifyJWT", createPlaylist)
