import asyncHandler from "../utils/asyncHandler.js";
import ApiError  from "../utils/apiError.js";
import uploadCloudinary from "../utils/cloudinary.js";
import{User} from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js"

const registerUser=asyncHandler(
    //get user details from frontend using postman
    //validation-(anything should not be empty)
    //check if(user already exist)
    //check for image,check for avatar
    //upload it to cloudinary (check avatar upload)
    //create iuser object-create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //if user created return res else return error

    async(req,res)=>{
        const {fullName,email,username,password}=req.body
        console.log("email: ",email);
        console.log("fullname: ",fullName);
        console.log("password: ",password);

        res.status(200).json({
            message:"success"
        })

        if(
            [fullName,email,username,password].some((field)=>{
                field?.trim()===""
            })
        ){
                throw new ApiError(400,"All fields are required")
        }

        const existedUser=User.findOne({
            $or:[{username},{email}]
        })

        if(existedUser)
        {
            throw new ApiError(409,"User with email or username already exists")
        }

        const avatarlocalPath=req.files?.avatar[0]?.path
        const coverImageLocalPath=req.files?.coverImage[0]?.path

        if(!avatarlocalPath)
        {
            throw new ApiError(400,"Avatar file image required")
        }

        const avatar=await uploadCloudinary(avatarlocalPath)
        const coverImage=await uploadCloudinary(coverImagelocalPath)

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

export default registerUser;