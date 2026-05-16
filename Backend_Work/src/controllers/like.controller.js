import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from '../models/video.model.js'
import { Like } from "../models/like.model.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // TODO: toggle like on video 
    // validate videoId (is it valid ObjectId?)
    // check if video exists in DB
    // check if like already exists in Like collection (where video = videoId AND likedBy = req.user._id)
    // if like EXISTS → delete it (unlike) //if like NOT EXISTS → create it (like)
    // return response with message //"Video Liked" or "Video Unliked"

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid VideoId")
    }

    const video = await Video.findById(videoId)
    // console.log("Video Details => ", video)
    if (!video) {
        throw new ApiError(400, "Video not found")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    console.log("Existing Like => ",existingLike)

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res
            .status(200)
            .json(
                new ApiResponse
                    (
                        200,
                        existingLike,
                        "Video like removed"
                    )
            )
    }

    if (!existingLike) {
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    existingLike,
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


    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "TweetId not found")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(400, "Tweet not found")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
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
                    "Tweet liked removed"
                )
            )
    }

    if (!existingLike) {
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

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),  // req.user._id = "user-1"(string) convert this into objectId for match
                video: { $exits: true, $ne: null }
                // $exits only checks the fields
                // ne if video object nhi null hai then its fail
            }
        },
        // step-2 Get full Video details
        {
            $lookup: {
                from: "videos", // where to look(collection)
                localField: "video", // value to have (like doc)
                foreignField: "_id", // value to match with (videos collection)
                as: "video", // where to put result (this video doc going to attach like document)
                // Step 3 - get video owner details
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
                                        avatar: 1,
                                        username: 1
                                    }
                                }
                            ]
                        }
                    },
                    // owner array to object
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }     
        },
        // video array to object
        {
            $addFields: {
                video: { $first: "$video" }
            }
        },
        {
            $project: {
                video: 1,
                likedBy: 1
            }
        }
    ])

    if(!likedVideos || likedVideos.length === 0){
        throw new ApiError(400, "No liked videos found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            likedVideos,
            "Liked video Fetched succesfully"
        )
    )
})



export{
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}


// NOTE: pipeline always create in lookups
/* 
$lookup: {
    from: "users",
    localField: "owner",
    foreignField: "_id",
    as: "owner",
    pipeline: [          // ← this door allows you to
        { $project },    //   do extra operations
        { $match },      //   on the fetched data
        { $addFields }   //   before returning it
    ]
}
*/