import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Video } from '../models/video.model.js'


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // TODO: toggle like on video 
    // validate videoId (is it valid ObjectId?)
    // check if video exists in DB
    // check if like already exists in Like collection (where video = videoId AND likedBy = req.user._id)
    // if like EXISTS → delete it (unlike) //if like NOT EXISTS → create it (like)
    // return response with message //"Video Liked" or "Video Unliked"

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "VideoId not valid")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "Video not found")
    }

    const existingLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLiked._id)
        return res
            .status(200)
            .json(200,
                new ApiResponse
                    (
                        200,
                        null,
                        "Video unliked"
                    )
            )
    }

    if (!existingLike) {
        await Like.create({
            video: videoId,
            likeBy: req.user._id
        })
        return res
            .status(200)
            .ApiResponse(
                200,
                new ApiResponse(
                    200,
                    null,
                    "Video Liked"
                )
            )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    // Todo
    // pahale mongodb mei _id params ko check karo
    // phir comment model find karo => Mil gya
    // check existing commnet or not
    // if existing comment like hai to unlike kardo res bhej do
    // nhi to agar unlike hai to like kara do create kar do and response

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "CommentId not found")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(400, "Comment not found")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })


    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    null,
                    "Comment liked Removed"
                )
            )
    }

    if (!existingLike) {
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    null,
                    "Comment liked"
                )
            )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    // TODO
    // check tweet id from mongoose validation
    // find tweet id in tweet model reference if the this id is in the collection
    // agar exit nahi karta to err
    // find in like model
    // if exit exit like laga
    // agar nhi to like hta do


    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "TweetId not found")
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(400, "Tweet not found")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })



    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(
            new ApiResponse (
                200,
                null,
                "Tweet liked removed"
            )
        )
    }

    if (!existingLike){
        await Like.create({
            tweet: tweetId,
            likeedBy: req.user._id
        })
        return res
        .status(200)
        .json(
            new ApiResponse(
                new ApiResponse(
                    200,
                    null,
                    "Tweet liked"
                )
            )
        )
    }


})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

})


