import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


//now we save this to .env file and use it here

// Function to upload an image to Cloudinary
const uploadCloudinary = async (localfilepath) => {
    try{
        if(!localfilepath)
            return null;
        const response = await cloudinary.uploader.upload(localfilepath,
            {
                resource_type: "auto"
            }
        )
        //file has been uploaded to cloudinary
        console.log("file has been uploaded to cloudinary",response.secure_url);

        //remove the locally saved file as the upload has failed
        if (fs.existsSync(localfilepath)) {
                fs.unlinkSync(localfilepath);
        }

        return response;
    }
    catch (err) {
        console.log("Cloudinary Error:", err);

        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }

        return null;
    }
}

export default uploadCloudinary;

//Upload an image
//     const uploadResult = await cloudinary.uploader
//     .upload(
//         'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//             public_id: 'shoes',
//         }
//     )
//     .catch((error) => {
//         console.log(error);
//     });
    
//     console.log(uploadResult);