import { Router } from 'express';
import {
    addcomment,
    deletecomment,
    getvideocomments,
    updatecomment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();


router.route("/:videoId").get(getvideocomments).post(verifyJWT,addcomment);
router.route("/c/:commentId").delete(verifyJWT,deletecomment).patch(verifyJWT,updatecomment);

export default router