import { asyncHandler } from '../utils/asyncHandler.js'

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend  Step-1
  // validation not-empty step-2
  // check if user already exists: check through email,username step-3
  // check for images(just check), check for avatar(this imp bzc required) step-4
  // upload them to cloudinary, avatar step-5
  // create user object - create antry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

})

export default registerUser