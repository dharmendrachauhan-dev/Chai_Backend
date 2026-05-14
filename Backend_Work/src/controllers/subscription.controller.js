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



export{
    toggleSubscription
}