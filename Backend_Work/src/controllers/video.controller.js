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
    // step 1 => extract videoId from req.params so u can get video
    // validate the videoId
    // step 2 => 

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