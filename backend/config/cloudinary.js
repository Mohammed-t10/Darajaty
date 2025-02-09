import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = (fileBuffer, folder, prefix = '', format = "pdf") => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            resource_type: "raw",
            folder: folder,
            format: format,
        };

        if (prefix) {
            const uniqueId = `${prefix}_${Date.now().toString(36)}`;
            uploadOptions.public_id = uniqueId;
        }

        const uploadStream = cloudinary.v2.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });
};

export const deleteFromCloudinary = async (fileUrl) => {
    try {
        const publicId = fileUrl.split('/').pop().split('.')[0];
        await cloudinary.v2.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary deletion failed");
    }
};

export default cloudinary.v2;
