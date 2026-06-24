import asyncHandler from "../utils/asyncHandler.js";
import ApiError  from "../utils/apiError.js";
import uploadCloudinary from "../utils/cloudinary.js";
import {User} from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

const generateAccessRefreshTokens=async (userId) =>{
    try{
        //take user details by id
        const user=await User.findById(userId)

        //generate accessToken and refreshToken
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        //save only refreshToken not password in manogoose
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave :false})

        return {accessToken,refreshToken}

    }catch(err){
        throw new ApiError(500,"something went wrong while generating refresh and access tokens")
    }
}

const registerUser=asyncHandler(
    //get user details from frontend using postman
    //validation-(anything should not be empty)
    //check if(user already exist)
    //check for image,check for avatar
    //upload it to cloudinary (check avatar upload)
    //create user object-create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //if user created return response else return error
    

    async(req,res)=>{
console.log("FILES:", req.files);

        const {fullName,email,username,password}=req.body
        console.log("email: ",email);
        console.log("fullname: ",fullName);
        console.log("password: ",password);

        if(
            [fullName,email,username,password].some((field)=>{
                return field?.trim()===""
            })
        ){
                throw new ApiError(400,"All fields are required")
        }

        const existedUser=await User.findOne({
            $or:[{username},{email}]
        })

        console.log(existedUser)

        if(existedUser)
        {
            throw new ApiError(409,"User with email or username already exists")
        }

        const avatarFile = req.files?.avatar?.[0];
const coverFile = req.files?.coverImage?.[0];

const avatarLocalPath = avatarFile?.path;
const coverImageLocalPath = coverFile?.path;

        if(!avatarLocalPath)
        {
            throw new ApiError(400,"Avatar file image required")
        }

        const avatar=await uploadCloudinary(avatarLocalPath)
        console.log("avatar response:", avatar);
        const coverImage=await uploadCloudinary(coverImageLocalPath)

        if(!avatar)
        {
            throw new ApiError(400,"Avatar file required")
        }

        const user = await User.create({
            fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url || "",
            email,
            password,
            username:username.toLowerCase()
        })

        const createdUser=await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser)
        {
            throw new ApiError(500,"something went wrong while registering a user")
        }

        return res.status(201).json(
            new ApiResponse(200,createdUser,"User registed successfully")
        )
    }
)

const loginUser=asyncHandler(async (req,res) => {
    // take data from req.body
    //login using username or email
    //find the user
    //if user exist check password using authentication
    //if password is right we generate access token and refresh token
    //send tokens in cookies

    //user enter these
    const{username,email,password}=req.body

    if(!(username || email))
    {
        throw new ApiError(400,"username or email is required")
    }

    const user=await User.findOne({
        $or:[{email},{username}]
    })

    if(!user)
    {
        throw new ApiError(404,"user not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid)
    {
        throw new ApiError(401,"Invalid user Credentials")
    }

    const {accessToken,refreshToken}=await generateAccessRefreshTokens(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    //send cookies and generate new access token and refresh token
    const options={
        httpOnly:true,
        secure:false
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,refreshToken,accessToken,
            },
            "User loggedIn Successfully"
        )
    )
})


const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    //remove cookies
    const options={
        httpOnly:true,
        secure:false
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"user loggedout successfully")
    )
})


const refreshAccessToken=asyncHandler(async(req,res)=>{
    try {
        //take refresh token
        const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken
    
        //check refresh token is there or not
        if(!incomingRefreshToken)
        {
            throw new ApiError(401,"Unauthorized request")
        }
    
        //verify refreshToken with .env
        const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        //taking user details
        const user=await User.findById(decodedToken?._id)
    
        if(!user)
        {
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken)
        {
            throw new ApiError(401,"refresh token is expired or used")
        }
    
        //generate new access token and refresh token 
        const options={
            httpOnly:true,
            secure:false
        }
    
        const {accessToken,newRefreshToken}= await generateAccessRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(200,
                {accessToken,refreshToken:newRefreshToken},
                "AccessToken refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
})

//if user wants to change password it means user is logged in so we use req.user to get user
const changeCurrentPassword=asyncHandler(async(req,res)=>{
    //user enter these--
    const {oldPassword,newPassword}=req.body

    const user=await User.findById(req.user?._id)
    
    //using user.model.js function isPasswordCorrect
    //check oldPassword and newPassword matches
    const isPasswordCorrect=user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect)
    {
        throw new ApiError(400,"Invalid old password")
    }

    //new password go to mongoose database
    user.password=newPassword
    //save new password also in database 
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(
        new ApiResponse(200,{},"Password changed successfully")
    )
})

//current user
const getCurrentUser=asyncHandler(async (req,res)=>{
    return res.status(200)
    .json(
        200,req.user,"current user fetched successfully"
    )
})

//update other details of user if developer(us) wants
const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body

    if(!(fullName || email))
    {
        throw new ApiError(400,"All fields are required")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName:fullName,
                email:email
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200,user,"email and fullName updated")
    )
})


//update Avatar after login it can possible only
const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path

    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar file is missing")
    }

    const avatar=await uploadCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200,user,"Avatar updated Succesfully")
    )
})


//update coverImage after login it can possible only
const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath)
    {
        throw new ApiError(400,"Avatar file is missing")
    }

    const coverImage=await uploadCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200,user,"Cover Image updated Succesfully")
    )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};