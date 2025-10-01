import { Router } from "express";
import { getchannelstats, getchannelvideos } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Get channel statistics (videos, views, likes, subscribers)
router.get("/stats/:channelId", verifyJWT, getchannelstats);

// Get all videos uploaded by a channel
router.get("/videos/:channelId", verifyJWT, getchannelvideos);

export default router;
