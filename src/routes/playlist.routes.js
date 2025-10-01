import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"; // correct import
import {
    createplaylist,
    getplaylistbyid,
    getuserplaylists,
    addvideotoplaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// 1️⃣ Create a new playlist (owner only)
router.post("/createplaylist", verifyJWT,upload.none(), createplaylist);

// 2️⃣ Get all playlists of a user (public)
router.get("/user/:userId", getuserplaylists);

// 3️⃣ Get a single playlist by ID (public)
router.get("/:playlistid", getplaylistbyid);

// 4️⃣ Update playlist (owner only)
router.put("/update/:playlistid", verifyJWT, updatePlaylist);

// 5️⃣ Delete playlist (owner only)
router.delete("/delete/:playlistid", verifyJWT, deletePlaylist);

// 6️⃣ Add video to playlist (owner only)
router.put("/:playlistId/add/:videoId", verifyJWT, addvideotoplaylist);

// 7️⃣ Remove video from playlist (owner only)
router.put("/:playlistid/remove/:videoId", verifyJWT, removeVideoFromPlaylist);

export default router;
