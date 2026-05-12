import mongoose from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Playlist } from "../models/playlist.model.js"

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

    if(!name.trim() || !description.trim()){
        throw new ApiError(400, "Both fields are required")
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Video Invalid")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400, "Video not found")
    }

    // protection from duplication

    const existingPlaylist = await Playlist.findOne({
        owner: req.user._id,
        videos: videoId
    })

    if(existingPlaylist){
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


