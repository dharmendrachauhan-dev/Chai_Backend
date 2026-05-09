import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";



const addComment = asyncHandler(async(req, res) => {
    // Create comments here
    // TODO
    // get id of video, owner and take content from req.body
    // agar param se _id le rhe hai to valid karo
    // content ko check karo
    // content ko 300 character allow karo check 
    // create karo aur teeno ko pass kar do video,owner and content
    // check comment created or not
    // return response

    const { videoId } = req.params
    const { content } = req.body
    const userId = req.user._id //coming from middleware

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Video ID invalid")
    }

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment not found")
    }

    if(content.length >= 300){
        throw new ApiError(400, "Character excided the limit")
    }

    const comment = await Comment.create({
        content: content.trim(),  // schema mei jo hai vhi daalo
        video: videoId,
        owner: userId
    })

    if(!comment){
        throw new ApiError(400, "Something went wrong while creating comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comment successfully created."
        )
    )
})

const updateComment = asyncHandler( async (req, res) => {
    
})

const deleteComment = asyncHandler( async (req, res) => {
    // delete comment
} )

const getVideoComment = asyncHandler ( async (req, res) => {
    // get all comments
})

export{
    addComment,
    updateComment,
    deleteComment,
    getAllComment
}





























//note
/* Comment ko kya hi karn hai
delete,update,getallcomments,addComments
*/
