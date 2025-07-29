import {v2 as cloudinary} from 'cloudinary';
import { response } from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // Adjust the path to your .env file if necessary

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
    });

const uploadOnCloudinary = async (localFilePath) => {
    // console.log("Uploading file to Cloudinary: ", localFilePath);
    const ext = path.extname(localFilePath);
    let resource_type = 'auto'; 
    
    try {
        if(!localFilePath){
            return null;
        }

        // Fix windows file path issues: converting backslashes to forward slashes
        // This is important because Cloudinary expects forward slashes in the file path
        // This is a Windows-style path with backslashes (\), 
        // but Cloudinary (and most Node.js tools that interact with external services) 
        //expects UNIX-style paths with forward slashes (/).
        const fixedFilePath = path.resolve(localFilePath).replace(/\\/g, '/');

        // upload the file on cloudinary
        if(['.mp4', '.webm', '.avi', '.mov'].includes(ext.toLowerCase())){
            resource_type = 'video'; // Set resource type to video for video files
        }
        const response = await cloudinary.uploader.upload(fixedFilePath, {
            resource_type: resource_type, // 'auto' for automatic detection of file type
        })
        // console.log("Cloudinary Response: ", response);
        
        // console.log("Exists?", fs.existsSync("public/temp/image.jpg"));
        fs.unlinkSync(fixedFilePath) // remove the locally saved temporary file after upload

        // file has been uploaded successfully
        return {
            url: response.secure_url, // secure_url is the URL of the uploaded file
            public_id: response.public_id, // public_id is the unique identifier for the uploaded file
            duration: response.duration
        }

        
        // console.log("file uploaded on cloudinary: ", response.url);
        // return response.url;
        
    } catch (error) {
        console.log("Error",error);
        
        if (localFilePath) fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload op failed
        return null;
    }
}

export {uploadOnCloudinary};