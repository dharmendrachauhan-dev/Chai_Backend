import { Router } from "express";
import { 
    addComment,
    updateComment
} from "../controllers/comment.controller";

// middlewares
import { verifyJWT } from '../middleware/auth.middleware.js'

const route = Router()


// Routes
router.route("/:videoId").post(verifyJWT, addComment)
router.route("/:commentId").patch(verifyJWT, updateComment)
router.route("/:commentId").patch(verifyJWT, deleteComment)
router.route("/:videoId").get(getVideoComment)