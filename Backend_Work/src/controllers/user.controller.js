import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudnary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend  Step-1 ✅
  // validation not-empty step-2 ✅
  // check if user already exists: check through email,username step-3 ✅
  // check for images(just check), check for avatar(this imp bzc required) step-4 ✅
  // upload them to cloudinary, avatar step-5 ✅
  // create user object - create entry in db ✅
  // remove password and refresh token field from response ✅
  // check for user creation ✅
  // return res

  // note file handling nhi kar rhe hai => multer ke through karenge user.routes.js mei kiya hai

  const {fullName, email, username, password}=req.body // yha se data aa rha hai like form, json data so we use req.body

  if([fullName,email,username,password].some((field)=>(
    !field || field.trim() === ""
  ))
  ) {
    throw new ApiError(400, "All fields required")
  }

  const existedUser = User.findOne({
    $or: [{ email },{ username }]
  })

  // check if user already exists:
  if (existedUser){
    throw new ApiError(409, "User with email or username already exists")
  }

  // express gives body
  // multer gives us files
  const avatarLocalPath = req.files?.avatar[0]?.path 
  // 1st property hamare server hai cloudinary pe nhi
  // User ne jo avatar image upload ki hai, uska local path nikal raha hai
  const coverImageLocalPath = req.files?.coverImage[0]?.path //


  if(!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImageLocalPath = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
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

  if (!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered succefully")
  )

})

export default registerUser