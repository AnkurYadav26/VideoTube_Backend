import { Router } from "express";
import {togglevideolike,togglecommentlike,toggletweetlike,getlikedvideos} from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

// Toggle like on a video
router.post("/video/:videoId", verifyJWT, togglevideolike);

// Toggle like on a comment
router.post("/comment/:commentId", verifyJWT, togglecommentlike);

// Toggle like on a tweet
router.post("/tweet/:tweetId", verifyJWT, toggletweetlike);

// Get all liked videos of the logged-in user
router.get("/videos", verifyJWT, getlikedvideos);

export default router