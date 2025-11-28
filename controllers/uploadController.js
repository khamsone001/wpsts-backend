const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Use a stream to upload the file from buffer
    const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'wpsts_profiles' },
        (error, result) => {
            if (error) {
                console.error('Cloudinary Error:', error);
                return res.status(500).json({ message: 'Image upload failed' });
            }
            // Send back the secure URL
            res.status(200).json({ url: result.secure_url });
        }
    );
    uploadStream.end(req.file.buffer);
};

const uploadPdf = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Use a stream to upload the file from buffer
    const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'wpsts_documents' }, // Use 'raw' for non-image files
        (error, result) => {
            if (error) {
                console.error('Cloudinary Error:', error);
                return res.status(500).json({ message: 'PDF upload failed' });
            }
            // Send back the secure URL
            res.status(200).json({ url: result.secure_url, original_filename: result.original_filename });
        }
    );
    uploadStream.end(req.file.buffer);
};

module.exports = { uploadImage, uploadPdf };