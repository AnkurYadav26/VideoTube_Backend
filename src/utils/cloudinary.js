import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;  // or throw new Error("File path required");

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // delete local file after upload
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        throw error; // important: rethrow so calling code knows upload failed
    }
};

export { uploadOnCloudinary };
