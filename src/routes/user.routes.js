import { Router } from "express";
import { loginuser, logoutuser, registeruser, refreshaccesstoken, changecurrentpassword, getcurrentuser, updataccounthandler, updateuseravatar, updateusercover, getuserchanneldetails, getwatchedhistory } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1

        },
        {
            name: "coverimage",
            maxCount: 1
        }
    ]),
    registeruser)
router.route("/login").post(loginuser)

//secured routes

router.route("/logout").post(verifyJWT, logoutuser)
router.route("/refresh-token").post(refreshaccesstoken)
router.route("/changepassword").post(verifyJWT, changecurrentpassword)
router.route("/current-user").get(verifyJWT, getcurrentuser)
router.route("/updateaccounthandler").patch(verifyJWT, updataccounthandler)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateuseravatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverimage"), updateusercover)
router.route("/c/:username").get(verifyJWT, getuserchanneldetails)
router.route("/history").get(verifyJWT, getwatchedhistory)

export default router 