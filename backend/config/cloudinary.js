const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadToCloudinary = async (file, folder) => {
  return new Promise((resolve, reject) => {
    // Check if file is PDF or document
    const isPDF = file.mimetype === 'application/pdf';
    const isImage = file.mimetype.startsWith('image/');
    
    // Extract file extension from original filename
    const fileExtension = file.originalname.split('.').pop();
    
    const uploadOptions = {
      folder: folder || 'chat-files',
      resource_type: isPDF ? 'raw' : 'auto',
      type: 'upload', // Public upload, not authenticated
      original_filename: file.originalname,
      filename_override: file.originalname.replace(/\.[^/.]+$/, ''), // Remove extension
      format: fileExtension // Preserve original format
    };
    
    // Only apply transformations to images
    if (isImage) {
      uploadOptions.transformation = [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' }
      ];
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          // Return object with proper filename
          result.originalFilename = file.originalname;
          console.log('File uploaded to Cloudinary:', result.secure_url);
          resolve(result);
        }
      }
    );
    uploadStream.end(file.buffer);
  });
};

exports.deleteFromCloudinary = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

module.exports.cloudinary = cloudinary;