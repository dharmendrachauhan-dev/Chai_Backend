import mongoose from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Playlist } from "../models/playlist.model.js"
import { jsx } from "react/jsx-runtime"

const createPlaylist = asyncHandler(async (req, res) => {
    // TODO 
    // check this name and description
    // take videoId from req.params 
    // check videoId
    // find video in db
    // verify user
    // create pipeline
    // check created plalist
    // return response
    const { name, description } = req.body
    const { videoId } = req.params

    if (!name.trim() || !description.trim()) {
        throw new ApiError(400, "Both fields are required")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Video Invalid")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Video not found")
    }

    // protection from duplication

    const existingPlaylist = await Playlist.findOne({
        owner: req.user._id,
        videos: videoId
    })

    if (existingPlaylist) {
        throw new ApiError(400, "You already have a playlist containing this video")
    }

    const playlist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        owner: req.user._id,
        videos: [videoId]
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                playlist,
                "Playlist successfully created"
            )
        )

})


const getUserPlaylists = asyncHandler(async (req, res) => {

    // TODO
    // get user from req.params
    // validate userId using isvlidObjectId
    // find all playlist where owner === userId
    // aggregate pipeline
    // return

    const { userId } = req.params
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $match: {
                            isPublished: true,
                        }
                    },
                    {
                        $project: {
                            title: 1, 
                            description: 1, 
                            thumbnail: 1,
                            duration: 1, 
                            views: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {$first: "$owner"},
                totalVideos: {$size: "$videos"}
            }
        },
        // sort
        {
            $sort:{
                createdAt: -1
            }
        },
        // shape the final output
        {
            $project:{
                name: 1, 
                description: 1,
                owner: 1,
                videos: 1,
                totalVideos: 1,
                createdAt: 1,
                updatedAt: 1,
            }
        }
    ])


    if(!playlists.length){
        throw new ApiError(400, "No playlists fetched successfully")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlists,
            "User playlists fetched successfully"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res)=>{
    //todo: get playlist by id
    //find playlist by id using aggregate pipeline
    //stage 1: Match playlists by _id
    //stage 2: Lookup videos from videos collection
    // subpipeline: filter only isPublished: true videos
    // subpipeline: project only needed video fields
    //stage 3: Lookup owner details from users collection
    // subpipeline: project only needed owner fields
    // stage 4: $addFields- flatten owner array -> object, add totalVideos
    // stage 5: $project - shape final output
    //todo: check if playlists exits (array empty check)
    // todo: return playlist

    const {playlistId} = req.params
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlist Id")
    }

    const playlist= await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: '_id',
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $match: {
                            isPublished: true
                        }
                    },
                    {
                        $project:{
                            views: 1,
                            title: 1,
                            description: 1,
                            thumbnail: 1,
                            duration: 1
                        }
                    },
                ]
            }
        },
        {
            $addFields: {
                owner: {$first : "$owner"},
                totalVideos: {$size: "$videos"}
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                owner: 1,
                videos: 1,
                totalVideos: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ])

    if(!playlist.length){
        throw new ApiError(400, "Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist[0],
            "Playlist succefully fetched"
        )
    )
})


const addVideoToPlaylist = asyncHandler(async (req, res) => {

    //todo
    //validate playlistId and videoId using ..
    //find playlist by playlistid
    //check if playlist exits
    //find the video by videoId
    //check if video exists
    //check ownership - req.user._id === playlist.owner
    //check duplicate - video already in playlist.videos[]
    //push videoId into playlist.videos[] using findByIdAndUpdate $push
    //return respose
    const {playlistId, videoId} = req.params
    
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlistId")
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }

    const playlist = await Playlist.findOne({_id: playlistId})

    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "Video not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400, "Unauthorized action")
    }

    // 1st Way manual duplicate check
    // if(playlist.videos.some(id => id.toString() === videoId)){
    //     throw new ApiError(400, "Video already in playlist")
    // }

    // await Playlist.findByIdAndUpdate(playlistId, {
    //     $push: { videos: videoId }
    // })

    // 2nd Way todo same thing
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId, 
        {
            $addToSet: { videos: videoId } // this handles duplicate under the hood
        },
        {new: true}
)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "video succefullly added in playlist"
        )
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // validate both
    // find playlist in db by playlist model
    // check if exits
    // find video from video model
    // check if video exits
    // user ko authorize karo
    // use $pull findbyIdAndUpdate
    const { playlistId, videoId } = req.params

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlistId")
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "video not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400, "Unauthorized action")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        },
        {new: true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "video succefully deleted"
        )
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    // todo
    // validate playlistId
    // search in db playlist is in or not 
    // check
    // verify user who is allowed to delete
    // find in db and delete
    // send response
    const { playlistId } = req.params

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlistId")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400, "Unauthorized action")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if(!deletedPlaylist){
        throw new ApiError(400, "Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "Playlist successfully deleted"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //todo
    //validate playlist id
    // check name, descrption empty or not
    // find by playlistId
    // check 
    // authorize karunga
    // db mei find and update new set karunga 
    // check
    // return kar dunga


    const { playlistId } = req.params
    const { name, description } = req.body

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlistId")
    }

    if(!name?.trim() || !description?.trim()){
        throw new ApiError(400, "Both fields are required")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400, "Unauthorzed action")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name.trim(),
                description: description.trim()
            }
        },
        {new : true}
    )

    if(!updatedPlaylist){
        throw new ApiError(400, "something went while updating fields")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Playlist successfully updated"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist
}

// NOTE For validation I have two ways to validate the req.params
// first way=> mongoose.Types.ObjectId.isValid( playlistId )
// secondWay=> import { isValidObjectId } from "mongoose"
//             isValidObjectId( playlistId )


