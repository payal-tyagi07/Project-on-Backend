import {Router} from "express";
import {changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory, 
    refreshAccessToken, 
    registerUser, updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage}
    from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {loginUser} from "../controllers/user.controller.js";
import {logoutUser} from "../controllers/user.controller.js";


const router=Router()

//wev added middleware here
router.route("/register").post(
    upload.fields(
        [
            {
                name: "avatar",
                maxCount:1
            },
            {
                name:"coverImage",
                maxCount:1
            }
        ]
    ),
    registerUser)

router.route("/login").post(loginUser)

//secured Routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

//verifyJWT middleware passed because we want to execute this after login
router.route("/changePassword").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").post(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)

//2 middlewares are used here
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/update-cover-image").patch(verifyJWT,upload.single("cover-image"),updateUserCoverImage)

//data from params
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/watch-history").get(verifyJWT,getWatchHistory)



export default router; 