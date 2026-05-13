import mongoose, { isValidObjectId } from "mongoose"
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
    if (isValidObjectId(userId)) {
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
                populate: [
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
                populate: [
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
                videos: {$size: "$videos"}
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

export {
    createPlaylist
}


