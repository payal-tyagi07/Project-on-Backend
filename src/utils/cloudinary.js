import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({ 
        cloud_name: 'djuobqgps', 
        api_key: '665986652432533', 
        api_secret: 'PAYALTYAGI' // Click 'View API Keys' above to copy your API secret
});

//now we save this to .env file and use it here

// Function to upload an image to Cloudinary
const uploadCloudinary = async (localfilepath) => {
    try{
        if(!localfilepath)
            return null;
        await cloudinary.uploader.upload(localfilepath, (err,result) => {
            if(err){
                console.log(err);
            }
        })
        //file has been uploaded to cloudinary
        console.log("file has been uploaded to cloudinary",response.url);
        return response;
    }
    catch(err){
        fs.unlinkSync(localfilepath)
        //remove the locally saved file as the upload has failed
        return null;
    }
}

export default uploadCloudinary;

// Upload an image
    const uploadResult = await cloudinary.uploader
    .upload(
        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
            public_id: 'shoes',
        }
    )
    .catch((error) => {
        console.log(error);
    });
    
    console.log(uploadResult);