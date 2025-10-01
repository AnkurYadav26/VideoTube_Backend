import { ApiError } from "../utils/apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
import JWT from "jsonwebtoken"
import { User } from "../models/user.models.js";




export const verifyJWT = asynchandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "unauthorized request")
        }

        const decodedtoken = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedtoken?._id).select("-password -refreshtoken")
        if (!user) {
            throw new ApiError(401, "Invalid access token ")
        }
        req.user = user;
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "error in authmidlleware")
    }
})