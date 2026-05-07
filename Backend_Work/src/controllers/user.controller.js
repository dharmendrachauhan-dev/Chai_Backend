import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.models.js'
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'


// create refresh and access token many times so make it separate method for it
// This is internal method
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    // koi bhi pahale token generate kara lo farak nhi padega

    const accessToken = user.generateAccessToken()
    console.log("Access Token : ", accessToken)
    const refreshToken = user.generateRefreshToken() // isko ham database mei store kar lenge
    console.log("Refresh Token : ", refreshToken)

    // refresh token ko database mei kaise daale
    user.refreshToken = refreshToken  // update in memory
    await user.save({ validateBeforeSave: false })  // db mei save to time lagega isliye await

    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Something went Wrong While generating refresh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // TODO
  // req.body  Step-1 ✅
  // validation not-empty step-2 ✅
  // check if user already exists: check through email,username step-3 ✅
  // check for images(just check), check for avatar(this imp bzc required) step-4 ✅
  // upload them to cloudinary, avatar step-5 ✅
  // create user object - create entry in db ✅
  // remove password and refresh token field from response ✅
  // check for user creation ✅
  // return res ✅

  // note file handling nhi kar rhe hai => multer ke through karenge user.routes.js mei kiya hai

  const { fullName, email, username, password } = req.body // yha se data aa rha hai like form, json data so we use req.body

  if ([fullName, email, username, password].some((field) => (
    !field || field.trim() === ""
  ))
  ) {
    throw new ApiError(400, "All fields are required")
  }

  // Email Checks  ---starts
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = email.toLowerCase().trim();

  // prevents from dots
  if (normalizedEmail.includes("..")) {
    throw new ApiError(400, "Invalid email format")
  }

  // prevents starting and Ending with dots
  if (normalizedEmail.startsWith(".") || normalizedEmail.endsWith(".")) {
    throw new ApiError(400, "Invalid email format")
  }

  // regex check
  if (!emailRegex.test(normalizedEmail)) {
    throw new ApiError(400, "Invalid email format")
  }

  //  ----EMAIL_CHECK_ENDS

  const existedUser = await User.findOne({
    $or: [{ email }, { username }]
  })

  console.log("Line 78 : already exites or not", existedUser)

  // check if user already exists:
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists")
  }

  // express gives body
  // multer gives us files
  const avatarLocalPath = req.files?.avatar?.[0]?.path
  // 1st property hamare server hai cloudinary pe nhi
  // User ne jo avatar image upload ki hai, uska local path nikal raha hai
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path //

  // Handlig the undefined if cover image is not given
  // let coverImageLocalPath;
  // if(req.files && Array.isArray(req.files.coverImage) && 
  // req.files.coverImage.length > 0) {
  //   coverImageLocalPath =  req.files.coverImage[0].path
  // }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(" Avatar Cloudinary :", avatar)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  console.log(" CoverImage Cloudinary :", coverImage)


  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create({
    fullName,
    avatar: {
      url: avatar.url,
      public_id: avatar.public_id
    },
    coverImage: {
      url: coverImage?.url || "",
      public_id: coverImage?.public_id || ""
    },
    email,
    password,
    username: username.toLowerCase()
  })

  console.log("Line 122 : Creating user ", user)

  const createdUser = await User.findById(user._id).select(
    //isme kya kya nhi chahiye removal
    "-password -refreshToken"
  )

  console.log("Line No. 129 : removed password and refresh tokan ", createdUser)

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered succefully")
  )

});


const loginUser = asyncHandler(async (req, res) => {
  // TODO
  // req.body => data ✅
  // check(username and email) ✅
  // find user ✅
  // pass check ✅
  // check nhi pass match nhi kiya to error dikha denge password is wrong ✅
  // generate access and refressh token ✅ (saparate method bna diya taaki vo refresh and access token de diya kare)
  // send cookies
  // send reponse

  // 9:12 => ( https://youtu.be/7DVpag3cO0g?si=vmzsiM5iwGS9_g_I )


  const { username, password, email } = req.body


  // koi ek field do
  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required")
  }

  // another way 
  // if (!username && !email){
  //  throw new ApiError(400, "Username or email is required")
  // }

  const user = await User.findOne({  // easy to take userId from user 
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new ApiError(404, "User does not exit")
  }

  // this is comparing the password and entered the password
  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credintials")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id) // async await hai in generateAccessAndRefreshTokens tab time lag sakta hai isliye await kar do

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken") // jo jo field nhi chahiye vo mana kar do
  // lean()=> This converts mongoose into plan js obj


  // send in cookies  // option kuch nhi hota its only object
  const options = {
    httpOnly: true,  // ab inke vajah se sirf server se modifyable honge not through frontend dev
    secure: true,
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        "User logged in successfully"
      )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
  //TODO this remove the refresh token
  await User.findByIdAndUpdate(
    req.user._id,
    { // update kya karna hai
      $unset: {
        refreshToken: 1 // this remove the field from document
      }
    },
    {
      returnDocument: 'after'
    }
  )

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out Successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(   //✅ Checks the token's signature (was it issued by us?)
      incomingRefreshToken,           //✅ Checks if the token is expired
      process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {    // isko global declare kar sakte taaki sab access le sake
      httpOnly: true,
      secure: true
    }

    // generate new refresh token and access token

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed succefully"
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {

  // Todo 
  // Extract Old passsword and  new Password from req.body
  // If any field is empty throw err
  // find user from db using req.user?._id (comes from verifyJWT middleware )
  // If user not found throw error
  // check oldPassword is correct using isPasswordCorrect method
  // If old PAssword is wrong throw error
  // Set user.password = newPAssword // temporary memory
  // Save to db with validatebeforesave: false (skip field verification) pree save hook will auto hash the new password before saving
  // Return the success Response

  const { oldPassword, newPassword } = req.body

  console.log("oldPassword : ", oldPassword)
  console.log("newPassword : ", newPassword)

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "All fields are reaquired ")
  }



  // kaun sa user hai jo pass change kar rha find user kiase middleware se req.user yha se mil jayega user

  const user = await User.findById(req.user?._id)
  console.log("This User is find from database so _id is taken from db woth the help of middelware", user)
  const isPasswordCurrect = await user.isPasswordCorrect(oldPassword)
  console.log(" Is PasswordCurrect checking Boolean : ", isPasswordCurrect)

  if (!isPasswordCurrect) {
    throw new ApiError(400, "Invalid Password")
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false }) // Skill all field validation and save in db

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))

})


const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      req.user,
      "User fetched Successfully"
    ))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  // TODO
  // Get the fields from req.body like fullname, email
  // show error if not found
  // call DB use method findByIdandUpdate provide id, use mongo db operator, new to true so this return updated on not old document and so remove password
  // then send api response


  const { fullName, email } = req.body
  // note => file update karne ke liye new cintroller and endpoint rakho taaki usko easily update kar sako better approch

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id, // This user come from middleware
    {
      $set: {    /// With $set Operator — only updates fullName and email
        fullName: fullName,  //explicit written
        email: email // exlpicit written
      }
    },
    { new: true } // Returns the updated document instead of the old one
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})


const updateUserAvatar = asyncHandler(async (req, res) => {
  // todo
  // 1. Extract file path from req.file?.path (comes from multer middleware)
  // 2. If file not found throw error
  // 3. Find user from db using req.user?._id
  // 4. Get old avatar public_id from user.avatar?.public_id
  // 5. Upload new avatar to cloudinary using local path
  // 6. If upload fails throw error
  // 7. If old public_id exists delete old avatar from cloudinary
  // 8. Update user in db with new avatar url and public_id using findByIdAndUpdate
  //    $set: { avatar: { url: avatar.url, public_id: avatar.public_id } }
  //    { new: true } to get updated document
  //    .select("-password") to remove password from response
  // 9. Return success response with updated user
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {  // checking local hai ya nhi
    throw new ApiError(400, "Avatar file is missing")
  }

  const user = await User.findById(req.user?._id)
  console.log("Ye db se user ko nikal rhe hai => ", user)

  const oldPublicId = user.avatar?.public_id
  console.log("yha oldPublicId dekhne ki koshis => ", oldPublicId)

  // Upload new avatar to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar")
  }

  // Delete old avatar from cloudinary
  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId)
  }

  // set=> Its a operator for update

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: {
          url: avatar.url, // updating the url
          public_id: avatar.public_id
        }
      }
    },
    { new: true }
  ).select("-password") // password hata do

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        "Avatar image updated successfully"
      ))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is missing")
  }

  const user = await User.findById(req.user?._id)
  const oldPublic_id = user.coverImage?.public_id

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on coveimage")
  }

  if (oldPublic_id) {
    await deleteFromCloudinary(oldPublic_id)
  }


  const updatedUser = await User.findByIdAndUpdate(  // refrence leke response bhejna
    req.user?._id,
    {
      $set: {
        coverImage: {
          url: coverImage.url,
          public_id: coverImage.public_id
        }
      }
    },
    { new: true }
  ).select("-password")

  // delete old cover image after upload new cover

  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "Cover image updated successfully")
    )

})


const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing")
  }
  // Writting Aggregation Pipeline

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase() // explicit return
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers" // if u use $ then u are saying its field
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] }, // in ka mtlb preset hai nhi hai
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: { // It allows for reformatting documents, creating new computed fields, and restricting the fields returned to the client.
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ])

  if(!channel?.length){
    throw new ApiError(400, "Channel does not exists")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      channel[0],
      "User Channel Fetched succesfully"
    )
  )
})

// Here using subpipeline
const getWatchHistory = asyncHandler (async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id) // yha id ko convert karna padta hai kyuki aggregate apna method sab lagata hai conversion neeeded
      }
    }, 
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory", // other pipeline
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
          }
        ]
      }
    },
    { // for front-end
      $addFields: {
        owner: {
          $first: "$owner"
        }
      }
    }
  ])

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user[0].watchHistory,
      "Watch history fetched succesfully"
    )
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
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
}