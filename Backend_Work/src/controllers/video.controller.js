import mongoose, { Query } from 'mongoose'
import { Video } from '../models/video.model.js'
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { asyncHandler } from "../utils/asyncHandler.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    //TODO: get all videos based on query, sort, pagination
    // step 1 => get all params from req.query
    // page, limit, query, sortBy, sortType, userId
    // step-2 => validate UserId if Provided
    // => is it valid ObjectId
    // step-3 build aggregate pipeline on video collection
    // $match => condition
    // a) isPublished : true (only published videos)
    // b) if query exits  (search in title OR description)
    // c) if UserId exits (filters by this user's videos)
    // $lookup => get owner details from users
    //         => project fullName, username, avatar
    // $addFields => owner array to object ($first)
    // $sort => sortBy field (views, duration, createdAt)
    //          sortType (asc => 1, desc => -1)
    // step-4 pass pipeline to aggregatePagins
    // => page and limit (partInt both)
    // step-5 check if videos found
    // step-6 return response

    const {page, limit, query, sortBy, sortType, userId} = req.params

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400, "Invalid UserId")
    }

    const videosAggregate = await Video.aggregate([
        {
            $match:{
                    isPublished: true, //... why bzc merging object into another object conditionally
                    ...(query ? {
                        $or: [
                            { title: { $regex: query, $options: "i"} },
                            { description: { $regex: query, $options: "i"} }
                        ]
                   } : {}),
                   // only add if userId exits
                    ...(userId ? { 
                        owner: new mongoose.Types.ObjectId(userId) // this help to convert BSON Object type bzc in url it comes in string 
                   } : {})
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "owner",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            username: 1,
                            fullName: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {$first: "$owner"}
            }
        },
        {  // data will come from url sortBy by views And sortType 
            $sort: {
                [sortBy] : sortType === "asc" ? 1 : -1
            }
        }
    ])

    const getVideos = await Video.aggregatePaginate(
        videosAggregate,
        {
            page: parseInt(page),
            limit: parseInt(limit)
        }
    )

    if(!getVideos){
        throw new ApiError(400, "Videos not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse (
            200,
            getVideos,
            "Videos succefully fetched"
        )
    )
})

const publicAVideos = asyncHandler(async (req, res)=> {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    // step 1 => check title and description ✅
    // step 2 => take video from req.file?.path (multer) ✅
    // step 3 => then check if req.file?.path have file or not ✅
    // step 4 => take thumbnail from req.files ✅
    //           check if thumbnail exists ✅
    // step - 4.0 upload video to cloudinary 
    //           check if upload succefull
    // step-5 => upload thumbnail to cloudinary 
    //           check if upload succefull
    // step-6 => get video duration
              // check if upload successful
    // step-7 => get video duration 
    //        // cloudinary gives duration after upload
    // step-8 => create video in DB
    //          title
    //          description
    //          videoFile
    //          thumbnail
    //          duration
    //          owner
    // step -9 => check if video created in DB
    // step -10 => return response
    
    if((!title?.trim() || !description?.trim())){
        throw new ApiError(400, "Both fields are required")
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    if(!videoLocalPath){
        throw new ApiError(400, "Video is not found")
    }

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is not found")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    if(!videoFile.url){
        throw new ApiError(400, "Error while uploading video")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail.url){
        throw new ApiError(400, "Error while uploading thumbnail")
    }

    // you dont need to calculate duration of video cloudinary does this automatically

    const videoIsPublished = await Video.create({
        title: title,
        description: description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user._id  //this is for db bzc db dont know how to who is uploading video so REQUIRE
    })

    if(!videoIsPublished){
        throw new ApiError(400, "Something went wrong while publishing video")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            videoIsPublished,
            "Video published successfully"
        )
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // TODO: update video details like title, description, thumbnail
    
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res)=> {
    const { videoId } = req.params
})


export {
    getAllVideos,
    publicAVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}