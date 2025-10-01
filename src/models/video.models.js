import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const videoschema = mongoose.Schema({

  videofile: {
    type: String,
    required: true,

  },
  thumbnail: {
    type: String,
    required: true,

  },

  title: {
    type: String,
    required: true,

  },
  duration: {
    type: Number,
    required: true

  },
  views: {
    type: Number,
    default: 0
  },
  ispublished: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  videoPublicId: {
    type: String
  },
  thumbnailPublicId: {
    type: String
  },



}, {
  timestamps: true
})
videoschema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoschema)