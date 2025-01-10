import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Subscription } from "../models/subscription.model.js";
import { Video } from "../models/video.model.js";

const generateAccesAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({vlidateBeforeSave: false})

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh or access token.")
    }
}

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

const loginUser = asyncHandler(async (req, res) => {
    const {email, userName, password} = req.body

    if (!userName && !email) {
        throw new ApiError(400, "Username or Email is required.")
    }

    const user = await User.findOne({
        $or: [{email}, {userName}]
    })

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(400, "Password doesn't match.")
    }

    const {accessToken, refreshToken} = await generateAccesAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User LoggedIn successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    console.log("I am Here")
    await User.findByIdAndUpdate(
        req.user.id,
        {
            $unset: {
                refreshToken: 1 // This removes the field from the document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(
                200, {}, "User logged out"
            ))
})

const refreshAccessTokenHandler = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request.")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Incoming Refresh Token.")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used.")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccesAndRefreshToken(user._id)
    
        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access Token refreshed."
            ))  
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, currentPassword} =  req.body

    const user = await User.findById(req.user?.id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password.");
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
            .status(200)
            .json(new ApiResponse(200, {}, "Password changed successfully"))

})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "Subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "Subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscibedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscibedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exists.")
    }

    return res.status(200).json(new ApiResponse(200, channel[0], "User channel info fetched."))
})

const getWatchHistory = asyncHandler(async (req, res) => {
    try {
        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup: {
                    from: "Videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: { $arrayElemAt: ["$owner", 0] }
                            }
                        }
                    ]
                }
            }
        ]);

        // Safeguard against no results
        if (!user.length) {
            return res.status(404).json(new ApiError(404, "No watch history found"));
        }

        return res.status(200).json(new ApiResponse(
            200,
            user[0]?.watchHistory || [],
            "Watch History Fetched Successfully"
        ));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error", error.message));
    }
});


export { registerUser, loginUser, logoutUser, refreshAccessTokenHandler, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory }