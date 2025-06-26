import mongoose, {Schema} from "mongoose";
const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User",
    },
    channel: {
        type: Schema.Types.ObjectId, // the channel being subscribed by the subscriber
        ref: "User",
    }
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
})

export const Subscription = mongoose.model("Subscription", subscriptionSchema);