import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";



const addComment = asyncHandler(async (req, res) => {
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

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Video ID invalid")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment not found")
    }

    if (content.length >= 300) {
        throw new ApiError(400, "Character excided the limit")
    }

    const comment = await Comment.create({
        content: content.trim(),  // schema mei jo hai vhi daalo
        video: videoId,
        owner: userId
    })

    if (!comment) {
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

const updateComment = asyncHandler(async (req, res) => {
    //TODO
    // step-1 take commentId=> req.param and content=> req.body ✅
    // step-2 to commentid ko validate ✅
    // step3 check content mei hai ya nhi agar nhi to err de de ✅
    // step-4 commentId se pure Comment collection mei check kar liya ye comment ka id kisme hai(variable me rakho) ✅
    // step-5 check karo comment mei kuch hai ki nahi ✅
    // step-6 comment mei id hai tweet daala owner already hai middleware se user ko match kar sakta hu (AUTHORIZE) 
    // step-7 find by id and update 
    // step-8 send res

    const { commentId } = req.params
    const { content } = req.body

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "CommentId not valid")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment not Found")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(400, "Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorised action")
    }

    const updateComment = await Comment.findByIdAndUpdate(
        { _id: commentId },
        {
            $set: {
                content
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updateComment,
                "Comment successfully updated"
            )
        )
})

const deleteComment = asyncHandler(async (req, res) => {
    // delete comment
    // get content and commentId
    // check both
    // find commentId in Comment Collection yha se aayega owner
    // Check if 
    // Authorize req.user._id !== comment.owner (don string mei karo)
    // then FindbyidAndDelete 
    // response

    const { commentId } = req.params

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid ID")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized Action")
    }

    await Comment.findByIdAndDelete(commentId) // ✅ simpler than findOneAndDelete

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Comment succefully deleted."
            )
        )
})

const getVideoComment = asyncHandler(async (req, res) => {
    // get all comments for a video
    // TODO
    // Get videoId from req.params
    // Get page and limit from req.query
    // page: which page user is on => (default => 1)
    // limit: how many commnets per page => (default => 10)
    // validate videoId
    // check video exits in video collection by find method
    // build aggregate pipeline
    // => $match
    // => $lookup
    // => $project
    // use mongooseAggregatePaginate
    // => pass page and limit here
    // => in handles skipping automatically
    // check if commnets found
    // return response

    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Video ID not found")
    }

    const videoComments = await Comment.find({ video: videoId })
    if (!videoComments) {
        throw new ApiError(400, "Video comment not found")
    }

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId) // converting bzc params mei string mei milta hai
            }
        },
        {
            $lookup: {
                from: "users", // go to the users collection
                localField: "owner",   // take owner ID from the comment
                foreignField: "_id",  // match with _id in users
                as: "owner",   // attach result back as owner
                pipeline: [
                    {
                        $project: {  // only brings this fields
                            username: 1, //user field
                            fullName: 1, //user field
                            avatar: 1 //user field
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {"$first": owner}  // array to object
            }
        }
    ])

    const getComments = await Comment.aggregatePaginate(
        commentsAggregate,
        {
            page: parseInt(page), // convert str to num
            limit: parseInt(limit) // convert str to num
        }
    )

    if (!getComments) {
        throw new ApiError(400, "All Comments not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                getComments,
                "Video comment successfully fetched"
            )
        )

})

export {
    addComment,
    updateComment,
    deleteComment,
    getAllComment
}





























//note
/* Comment ko kya hi karn hai
delete,update,getallcomments,addComments
*/
