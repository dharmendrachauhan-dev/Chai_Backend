import { Router } from "express";
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()


router.route("/").post(verifyJWT, createPlaylist)
router.route("/user/:userId").get(getUserPlaylists)
router.route("/:playlistId").get(getPlaylistById)

// Secured Route
router.route("/add/:playlistId/:videoId").patch(verifyJWT, addVideoToPlaylist)
router.route("/remove/:playlistId/:videoId").patch(verifyJWT, removeVideoFromPlaylist)
router.route("/:playlistId").delete(verifyJWT, deletePlaylist)
router.route("/:playlistId").patch(verifyJWT, updatePlaylist)

export default router