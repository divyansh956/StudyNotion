const cloudinary = require('cloudinary').v2;

exports.uploadImage = async (file, folder, height, quality) => {
    try {
        const options = { folder: folder, height: height, quality: quality };

        return await cloudinary.uploader.upload(file.tempFilePath, options);
    }
    catch (error) {
        console.log(error);
    }
}