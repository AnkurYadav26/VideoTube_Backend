import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";



const generateaccessandrefreshtokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accesstoken = user.generateAccessToken();
    const refreshtoken = user.generateRefreshToken();
    user.refreshtoken = refreshtoken;
    await user.save({ validateBeforeSave: false });
    return { accesstoken, refreshtoken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh tokens "
    );
  }
};
const registeruser = asynchandler(async (req, res) => {
  const { username, fullname, email, password } = req.body;

  if (
    [username, fullname, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are require ");
  }
  const existeduser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existeduser) {
    throw new ApiError(409, "user already existed");
  }
  const avatarlocalpath = req.files?.avatar[0]?.path;
  // const coverimagelocalpath = req.files?.coverimage[0]?.path;
  let coverimagelocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverimagelocalpath = req.files.coverimage[0].path;
  }

  if (!avatarlocalpath) {
    throw new ApiError(400, " avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarlocalpath);
  const coverimage = await uploadOnCloudinary(coverimagelocalpath);

  if (!avatar) {
    throw new ApiError(400, "avatar file is required ");
  }

  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    password,
    email,
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
  });

  const createduser = await User.findById(user._id).select(
    "-password -refreshtokens"
  );

  if (!createduser) {
    throw new ApiError(500, " Something went wrong while registring the user");
  }
  return res
    .status(201)
    .json(new apiresponse(200, createduser, "User registered successfully"));
});
const loginuser = asynchandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, " pls provide username or email ");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, " user not found pls register ");
  }
  const ispasswordvalid = await user.isPasswordCorrect(password);

  if (!ispasswordvalid) {
    throw new ApiError(401, " invalid credintials password wrong  ");
  }
  const { accesstoken, refreshtoken } = await generateaccessandrefreshtokens(
    user._id
  );

  const loggedinuser = await User.findById(user._id).select(
    "-refreshtoken -password"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accesstoken", accesstoken, option)
    .cookie("refreshtoken", refreshtoken, option)
    .json(
      new apiresponse(
        200,
        {
          user: loggedinuser,
          accesstoken,
          refreshtoken,
        },
        "user logged in successfully "
      )
    );
});
const logoutuser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
        $set: { refreshtoken: null },
    },
    {
      new: true,
    }
  );

  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accesstoken", option)
    .clearCookie("refreshtoken", option)
    .json(new apiresponse(200, {}, "user logged out  successfully"));
});
const refreshaccesstoken = asynchandler(async (req, res) => {
  const incomingrefreshtoken =
    req.cookies.refreshtoken || req.body.refreshtoken;
  if (!incomingrefreshtoken) {
    throw new ApiError(401, "unauthorized request in incoming token ");
  }
  try {
    const decodedtoken = jwt.verify(
      incomingrefreshtoken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedtoken?._id);
    if (!user) {
      throw new ApiError(401, "unauthorized user after decode ");
    }
    if (incomingrefreshtoken !== user?.refreshtoken) {
      throw new ApiError(401, " refreshtoken is expired or used");
    }
    const option = {
      httpOnly: true,
      secure: true,
    };
    const { accesstoken, refreshtoken } = await generateaccessandrefreshtokens(
      user._id
    );
    return res
      .status(200)
      .cookie("accesstoken", accesstoken, option)
      .cookie("refreshtoken", refreshtoken, option)
      .json(
        new apiresponse(
          200,
          { accesstoken, refreshtoken },
          "accesstoken refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
const changecurrentpassword = asynchandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Both old and new passwords are required");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new apiresponse(200, {}, "Password changed successfully"));
});
const getcurrentuser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiresponse(200, req.user, "current user fetched successfully"));
});
const updataccounthandler = asynchandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new apiresponse(200, user, "account detail updated successfully"));
});
const updateuseravatar = asynchandler(async (req, res) => {
  const avatarimagelocalpath = req.file?.path;
  if (!avatarimagelocalpath) {
    throw new ApiError(400, "avatar file is missing");
  }
  const avatar = await uploadOnCloudinary(avatarimagelocalpath);
  if (!avatar.url) {
    throw new ApiError(400, "avatar file error while uploading on cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new apiresponse(200, user, "avatar updated successfully"));
});
const updateusercover = asynchandler(async (req, res) => {
  const coverimagelocalpath = req.file?.path;
  if (!coverimagelocalpath) {
    throw new ApiError(400, "cover image file is missing");
  }
  const coverimage = await uploadOnCloudinary(coverimagelocalpath);
  if (!coverimage.url) {
    throw new ApiError(400, "cover file error while uploading on cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverimage: coverimage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new apiresponse(200, user, "cover updated successfully"));
});
const getuserchanneldetails = asynchandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "usernameismissing");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribeTo",
      },
    },
    {
      $addFields: {
        subscriberscount: {
          $size: "$subscribers",
        },
        channelsubscribedtocount: {
          $size: "$subscribeTo",
        },
        issubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscriberscount: 1,
        channelsubscribedtocount: 1,
        issubscribed: 1,
        avatar: 1,
        coverimage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exist");
  }

  return res
    .status(200)
    .json(
      new apiresponse(200, channel[0], "user channel fetched successfully")
    );
});
const getwatchedhistory = asynchandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchhistory",
        foreignField: "_id",
        as: "watchhistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new apiresponse(
        200,
        user[0]?.watchhistory || [],
        "watch history fetched successfully"
      )
    );

});



export {
  registeruser,
  loginuser,
  logoutuser,
  refreshaccesstoken,
  changecurrentpassword,
  getcurrentuser,
  updataccounthandler,
  updateuseravatar,
  updateusercover,
  getuserchanneldetails,
  getwatchedhistory
};
