import mongoose, { Schema } from "mongoose";

const subscriptionschema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true }); // lowercase 'timestamps'

export const Subscription = mongoose.model("Subscription", subscriptionschema);
