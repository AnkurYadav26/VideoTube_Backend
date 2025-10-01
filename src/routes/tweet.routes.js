import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    createtweet, 
    getusertweets, 
    updatetweet, 
    deletetweet 
} from "../controllers/tweet.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Create a new tweet
router.post("/create", verifyJWT,upload.none(), createtweet);//important step to understand for form data 

// Get all tweets of the logged-in user
router.get("/my", verifyJWT, getusertweets);

// Update a tweet
router.put("/:id", verifyJWT, upload.none(),updatetweet);

// Delete a tweet
router.delete("/delete/:id", verifyJWT, deletetweet);

export default router;
