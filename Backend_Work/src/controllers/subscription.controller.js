import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.j";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    //todo
    //validate
    //find subscriber and channel exits in db or not
    //check
    //if existingsubscriber delete by id and write those user and channelid while remove
    // if not then create add them create it obj
    const { channelId } = req.params

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    const existingSubscriber = await Subscription.findOne({  //take existingSubscriber from here hai to obj
        channel: channelId,
        subscriber: req.user._id
    })

    if(existingSubscriber){
         await Subscription.findByIdAndDelete(existingSubscriber._id)// this

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Subscription removed successfully"
            )
        )
    }

    if(!existingSubscriber){
        const newSubscription = await Subscription.create({
            channel: channelId,
            subscriber: req.user._id
        })

        return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                newSubscription,
                "Subscribed successfully"
            )
        )
    }

})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // todo
    // Validate channelId using
    // find all subscription where channel === channeId using aggregate pipeline
    // stage1: $match: channel: ObjectId(channelId)
    // stage2: $lookup: join users collection on subscriber field
        //subpipeline: Project only needed fields (username, fullname)
    // stage3: $addFields - flatten subscribers array
    // stage4:$project - shape final output
    // check if channel has any subsctibers (array empty check)
    // return subscriber list with total cout
    const {channelId} = req.params

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400, "Invalid channelId")
    }

    const channelSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribed",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                        }
                    }
                ]
                
            }
        },
        {
            $addFields: {
                subscriber: {$first: "$subscribed"}
            }
        },
        {
            $project: {
                fullname: 1,
                avatar: 1,
                username: 1,
                subscribed:1,
            }
        }
    ])

if(!channelSubscribers.length){
    throw new ApiError(400,[], "Channel has no subscribers")
}

return res
.status(200)
.json(
    new ApiResponse(
        200,
        {
            totalSubscribers: channelSubscribers.length,
            channelSubscribers
        },
        "Subscribers fetched successfully"
    )
)

})

export{
    toggleSubscription,
    getUserChannelSubscribers
}