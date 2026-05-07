import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    // 1st find req.body
    // 2nd userId from middleware

    // 3rd check input if content written or empty
    // yes => go if no=> throw err

    // condition for how much character write allow
    // yes => go if no=> throw err

    // tweet create yaani save to db
    // res bhej do 201
    const { content } = req.body
    const userId = req.user._id  // this come from middleware

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Write something to post.")
    }
    console.log(content.length)

    if (content.length >= 280) {
        throw new ApiError(400, "Tweet cannot exceeded 280 characters")
    }


    const tweet = await Tweet.create({
        content: content.trim(),
        owner: userId,
    })

    if (!tweet) {
        throw new ApiError(400, "Failed to create tweet")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                tweet,
                "Tweet created successfully"
            )
        )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    // get username from params
    // check
    // do aggregate pipeline 
    // 1) match
    // 2) lookup
    // 3) addfields
    // 4) project
    // check if tweets are present
    // return

    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing.")
    }

    const userTweets = await User.aggregate([
        {
            $match: { username: username.toLowerCase() }
        },
        {
            $lookup: {
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "userTweets"
            }
        },
        {
            $project: {
                userTweets: 1,
                username: 1,
                avatar: 1
            }
        }
    ])

    console.log((await userTweets).length)

    if (!userTweets || userTweets.length === 0) {
        throw new ApiError(404, "User do not exits")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                userTweets[0],
                "User Tweets succesfully fetched."
            )
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    // TODO: update tweet
    // authorization=> are you that who allowed to perform this action and 
    // authentication=> who r u ? both use here
    //TODO
    //1. get tweetId from req.params ✅
    //2. get new content from req.body ✅
    //3. validate tweetId (is it valid ObjectId)✅
    //4) validate (is it empty) ✅
    //5) find tweet in db by tweetId ✅
    //6) check if tweet Exits ✅
    //7) check logged in user is owner of tweet (authorization)
    //   tweet.owner === req.user._id
    //8) update tweet with new content
    //9) return response

    const { tweetId } = req.params  // tweets schema _id created when you created tweet 1st time
    const { content } = req.body   // this is new content when you rewritten/ updated one

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweetId.")
    }

    if(!content?.trim()){
        throw new ApiError(400, " Content is required ")
    }

    // find tweet in db by tweetId
    const tweet = await Tweet.findById(tweetId) // tweet.owner this come from here tweet variable

    // check if tweet Exits
    if (!tweet) {
        throw new ApiError("Tweet not found.")
    }

    // authorization ho rha hai
    if (tweet.owner.toString() !== req.user._id.toString()) {  //req.user._id => This come from VerifyJWT
        throw new ApiError(403, " Unauthorized ")
    }

    // update in db
    const updateTweet = await Tweet.findByIdAndUpdate(
        { _id: tweetId },  // find
        {
            $set: {
                content
            }
        },
        { new: true } // return updated one
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updateTweet,
            "Tweet is a successfully Updated"
        )
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    //get tweet Id from params
    //tweet Id validatation
    //search in db 
    //check !found
    //authorize
    //db ko call findidanddelete
    //response

    const { tweetId } = req.params

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Tweet not valid")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(400, "Tweet not found")
    }

    if(req.user._id.toString() !== tweet.owner.toString()){
        throw new ApiError(403, "Unauthorized")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "Tweet is successfully deleted."
        )
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}