import { v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: "./.env" })

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return console.log("Localfile path not found")
            // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
          resource_type: "auto"
        })
        // file has been uploaded successfull
        // console.log('file is uploaded on cloudinary', response.url)
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file
        return response;

    } catch (error) {
        console.log("Error while uploading on cloudinary", error)   
        fs.unlinkSync(localFilePath) // remove the locally saved temporary
        // as the upload operation got failed
        return null;
    }
}


export const deleteFromCloudinary = async (public_id) => {
    try {
        if (!public_id) return null
        const response = await cloudinary.uploader.destroy(public_id)
        return response
    } catch (error) {
      console.log("Error during deleting cloudinary", error)
      return null  
    }
}