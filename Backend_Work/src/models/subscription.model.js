import mongoose, { model, Schema } from "mongoose";


const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whom "subscriber" is subscribing
        ref: "User"
    }
}, { timestamps: true }
)

export const subscription = model.mongoose("Subscription", subscriptionSchema) // Subscription convert into subscriptions

// "Subscription" => The name → Mongoose will look for/create a collection called subscriptions (lowercase + plural)