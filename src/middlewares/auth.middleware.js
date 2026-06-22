//this middleware varify that if user exist or not

import { User } from "../models/user.model";
import asyncHandler from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

export const verifyJWT=asyncHandler(async(req,res,next)=>{
try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token)
        {
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken=await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user  =await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
    
        if(!user)
        {
            throw ApiError(401,"Invalid accessToken")
        }
    
        req.user=user;
        next()
} catch (error) {
    throw new ApiError(401,error?.message || "invalid access Token")
}

})