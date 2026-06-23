//this middleware varify that if user exist or not

import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";


export const verifyJWT=asyncHandler(async(req,res,next)=>{
try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token)
        {
            throw new ApiError(401,"Unauthorized request")
        }
    
        //check user token and our token that is in .env is verified or not
        const decodedToken=await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        console.log("Decoded Token:", decodedToken);
    
        const user  =await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
    
        if(!user)
        {

            throw new ApiError(401,"Invalid accessToken")
        }
    
        //user now can be access using req.user
        req.user=user;
        next()
} catch (error) {
    throw new ApiError(401,error?.message || "invalid access Token")
}

})