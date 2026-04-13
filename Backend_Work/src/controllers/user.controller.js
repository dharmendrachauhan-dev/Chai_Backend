import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.models.js'

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend  Step-1
  // validation not-empty step-2
  // check if user already exists: check through email,username step-3
  // check for images(just check), check for avatar(this imp bzc required) step-4
  // upload them to cloudinary, avatar step-5
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  // note file handling nhi kar rhe hai => multer ke through karenge user.routes.js mei kiya hai

  const {fullName, email, username, password}=req.body // yha se data aa rha hai like form, json data so we use req.body
  if (fullName === "" ){
    throw new ApiError(400, "fullname is required")
  }




// Hitesh Code
  if(
    [fullName, email, username, password].some((field)=> (
      field?.trim() === ""
    ))
  ) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = User.findOne({
    $or: [{ email },{ username }]
  })

  // check if user already exists:
  if (existedUser){
    throw new ApiError(409, "User with email or username already already exists")
  }

})

export default registerUser