import { Router } from "express";
import { 
    addComment,
    deleteComment,
    getVideoComment,
    updateComment
} from "../controllers/comment.controller.js";

// middlewares
import { verifyJWT } from '../middleware/auth.middleware.js'

const router = Router()


// Routes
router.route("/add/:videoId").post(verifyJWT, addComment)
router.route("/update/:commentId").patch(verifyJWT, updateComment)
router.route("/delete/:commentId").delete(verifyJWT, deleteComment)
router.route("/:videoId").get(getVideoComment)

export default router