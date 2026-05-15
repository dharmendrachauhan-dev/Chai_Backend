import mongoose, { Schema } from "mongoose";


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

export const Subscription = mongoose.model("Subscription", subscriptionSchema) // Subscription convert into subscriptions in mongodb

// "Subscription" => The name → Mongoose will look for/create a collection called subscriptions (lowercase + plural)