import mongoose, { Query } from 'mongoose'
import { Video } from '../models/video.model.js'
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { asyncHandler } from "../utils/asyncHandler.js"



const getAllVideos = asyncHandler(async (req, res) => {
 
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

   const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    if(userId && !mongoose.Types.ObjectId.isValid(userId)){ // userId isliye lagaya taaki error bypass kar sake
        throw new ApiError(400, "Invalid UserId")
    }

    const videosAggregate = Video.aggregate([  // yha await ki jarurat nhi hai
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
                localField: "owner",
                foreignField: "_id",
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
        videoFile: {
            url: videoFile.url,
            public_id: videoFile.public_id
        },
        thumbnail: {
            url: thumbnail.url,
            public_id: thumbnail.public_id
        },
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
    // TODO: get video by id
    // step-1 => validate videoId
    // step-2 => build Aggreagte pipeline on video collection
    // $match => find video where _id = videoId
    // $lookup => get owner details from users
    // project fullname, username, avatar
    //$addFields => owner array to object ($first)
    //$lookup => get likes count of this video 
    // from likes collection where video = videoId
    // $addFields => likesCount (how many likes)
    // isLiked (did logged in user like this video?)
    // step-3 => check if video found
    // step-4 => increment views by 1
    // user watched video = add 1 view
    // step-5 => return response

    const { videoId } = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid VideoId")
    }

    const video = await Video.aggregate([
        {
            $match: {_id: new mongoose.Types.ObjectId(videoId)}
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            username: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner: {$first: "$owner"}
            }
        },
        {
            $lookup:{
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
                pipeline : [
                    {
                        $project:{
                            likedBy: 1,
                            video: 1
                        }
                    }
                ]
            }
        },
        { // addFields = add new calculated fields that don't exist in DB
            $addFields: {
                // count likes array => gives number
                likesCount: { $size: "$likes" },

                // check if user is in likes array
                isLiked: {
                    $cond: {
                        if: {$in: [new mongoose.Types.ObjectId(req.user?._id), "$likes.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            }
        },

    ])
    
    if(!video || video.length === 0){
        throw new ApiError(400, "Video not found")
    }

    await Video.findByIdAndUpdate(
        videoId,
        { //adds 1 to whatever current value is eg 0=>1 , 100=>101, 200=>201 
            $inc: {views: 1}
        },
        {new : true}
    )

    await User.findByIdAndUpdate(
        req.user._id,
        { // addToSet → adds only if not already in array
            $addToSet: { watchHistory: videoId } // adds only if not already there
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video[0],
            "Video fetched Succefully"
        )
    )

})

const updateVideo = asyncHandler(async (req, res) => {

    // TODO: update video details like title, description, thumbnail
    // get videoId from req.params ✅
    // get title, description from req.body ✅
    // get thumbnail by req.file single ✅

    // valid videoId ✅
    // validate title and description ✅
    // validate thumbnail

    // find video in DB by videoId 
    // check if video exists
    // authorize => is logged in user the owner

    // delete old thumbnail from cloudinary
    // upload new thumbnail to cloudinary check if upload successful

    // update video in DB
    // => title
    // => description
    // => thumbnail (new cloudinary url)

    // return response

    const { videoId } = req.params
    const { title, description } = req.body
    const thumbnailLocalPath = req.file?.path // for file follow this

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }

    if(!title?.trim() || !description?.trim()){
        throw new ApiError(400, "Something went wrong all fields required")
    }

    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "video not found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Unauthorized Action")
    }

    const oldThumbnailPublicId = video.thumbnail.public_id

    await deleteFromCloudinary(oldThumbnailPublicId)

    const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!newThumbnail.url){
        throw new ApiError(400, "Error while uploading thumbnail")
    }

    const UpdatedVideo = await Video.findByIdAndUpdate(
        {_id: videoId},
        {
            $set: {
                title,
                description,
                thumbnail: {
                    url: newThumbnail.url,
                    public_id: newThumbnail.public_id
                }
            }
        },
        {new: true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            UpdatedVideo,
            "All fields are updated"
        )
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    // TODO: delete video
    // get videoId from req.params
    // validate the videoId
    // find in db by videoId
    // check if found
    // authorize it with verifyJWT
    // search in db find by id and delete
    // response

    const { videoId } = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "video not found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Unauthorized action")  // if you try to access unauthorized thing then you show the error of 403
    }
    
    await deleteFromCloudinary(video.thumbnail.public_id) // delete thumbnail from cloudinary
    await deleteFromCloudinary(video.videoFile.public_id, "video") // delete videoFile from cloudinary
    await Video.findByIdAndDelete(videoId)

    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "video removed successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res)=> {
    // TODO
    // get videoId ✅
    // validate ✅
    // find videoId in db ✅
    // if not show error
    // authorize the user
    // flip isPublished value (makeit false) default is true in db
    // save to db 
    // return res
    const { videoId } = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "videoId invalid")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "video not found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400, "Unauthorized action")
    }

    const toggleVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        {new : true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            toggleVideo,
            "Publish status toggle successfully"
        )
    )
})


export {
    getAllVideos,
    publicAVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}