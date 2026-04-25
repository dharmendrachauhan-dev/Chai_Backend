import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'


// create refresh and access token many times so make it separate method for it
// This is internal method
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    // koi bhi pahale token generate kara lo farak nhi padega

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken() // isko ham database mei store kar lenge

    // refresh token ko database mei kaise daale
    user.refreshToken = refreshToken
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
  console.log(fullName)

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
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    //isme kya kya nhi chahiye removal
    "-password -refreshToken"
  )

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
    .cookie("accessToken", accessToken, options)  // see typo if logout failed
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
      $set: {
        refreshToken: undefined
      } // This operator
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
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
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
  const { oldPassword, newPassword } = req.body

  // kaun sa user hai jo pass change kar rha find user kiase middleware se req.user yha se mil jayega user

  const user = await User.findById(req.user?._id)
  const isPasswordCurrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCurrect) {
    throw new ApiError(400, "Invalid Password")
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false }) // hook tabhi call hoga jab save hoga

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))

})


const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "Current user is fetched successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body
  // note => file update karne ke liye new cintroller and endpoint rakho taaki usko easily update kar sako better approch

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required")
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {    /// look into it
        fullName,
        email: email
      }
    },
    { new: true }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {

  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {  // checking local hai ya nhi
    throw new ApiError(400, "Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar")
  }

  // set=> Its a operator for update

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url // updating the url
      }
    },
    { new: true }
  ).password("-password") // password hata do

  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "Cover image updated successfully")
    )
})


const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on coveimage")
  }

  const user = await User.findByIdAndUpdate(  // refrence leke response bhejna
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    { new: true }
  ).select("-password")

  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "Cover image updated successfully")
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
}