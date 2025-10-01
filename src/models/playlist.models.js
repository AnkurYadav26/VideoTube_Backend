import mongoose, { Schema, Types } from "mongoose";

const playlistschema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
     videos: [  // <-- plural + array banaya
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })

export const Playlist = mongoose.model("playlist", playlistschema)