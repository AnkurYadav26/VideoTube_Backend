import { Router } from "express";
import { togglesubscription, getuserchannelsubscribers, getsubscribedchannels } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Toggle subscription for a channel (subscribe/unsubscribe)
router.post("/toggle/:channelId", verifyJWT, togglesubscription);

// Get all subscribers of a channel
router.get("/subscribers/:channelId", verifyJWT, getuserchannelsubscribers);

// Get all channels a user has subscribed to
router.get("/channels/:subscriberId", verifyJWT, getsubscribedchannels);

export default router;
