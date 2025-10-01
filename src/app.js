import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

import userrouters from "./routes/user.routes.js";
import videorouters from "./routes/video.routes.js";
import tweetrouters from "./routes/tweet.routes.js";
import playlistrouters from "./routes/playlist.routes.js";
import commentrouters from "./routes/comment.routes.js";
import likerouter from "./routes/like.routes.js";
import channelrouter from "./routes/dashboard.routes.js";
import subscriptionrouter from "./routes/subscription.routes.js";

// Mount routers
app.use("/api/v1/users", userrouters);
app.use("/api/v1/videos", videorouters);
app.use("/api/v1/tweets", tweetrouters);
app.use("/api/v1/playlist", playlistrouters);
app.use("/api/v1/comments", commentrouters);
app.use("/api/v1/likes", likerouter);
app.use("/api/v1/dashboard", channelrouter);
app.use("/api/v1/subscriptions", subscriptionrouter);


export { app }