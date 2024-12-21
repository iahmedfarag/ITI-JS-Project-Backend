import cloudinary from "../services/cloudinary.js";

export const uploadToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });

        stream.end(fileBuffer); // Write the buffer to the stream
    });
};
