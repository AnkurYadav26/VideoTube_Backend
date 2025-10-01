import { Router } from "express"; 
import { verifyJWT } from "../middlewares/auth.middleware.js"; 
import { upload } from "../middlewares/multer.middleware.js"; 
import {
    deletevideo,
    getallvideo,
    getvideobyid,
    togglepublishstatus,
    updatevideo,
    publishvideo
} from "../controllers/video.controller.js"; 

const router = Router(); 

// Public: get all published videos
router.route("/").get(getallvideo);

// ---------------------- Protected Routes ----------------------

// Publish new video (requires videoFile, thumbnail, title, description)
router.route("/publish").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishvideo
);


// Get single video
router.route("/:videoId").get(getvideobyid);

// Update video (thumbnail, title, description only — optional fields)
router.route("/update/:videoId").patch(
    verifyJWT,
    upload.single("thumbnail"), 
    updatevideo
);

// Delete video
router.route("/delete/:videoId").delete(
    verifyJWT,
    deletevideo
);

// Toggle publish status
router.route("/toggle/publish/:videoId").patch(
    verifyJWT,
    togglepublishstatus
);

export default router;
