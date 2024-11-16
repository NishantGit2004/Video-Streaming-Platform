import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //get data from frontend
    //validation
    //check if user already exists
    //check if avatar is present
    //upload cloudinary
    //create user object
    //remove password and refresh token field
    //check if new user is created

    const {fullName, email, userName, password} = req.body

    if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{email}, {userName}]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists.")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    let coverImageLocalPath

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required.")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required.")
    }

    const createdUser = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()    
    })

    const user = await User.findById(createdUser._id).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(500, "Error while creating user.")
    }

    console.log(createdUser)

    return res.status(201).json(new ApiResponse(200, user, "User Registered Successfully."))
})

export { registerUser }