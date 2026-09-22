import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadToCloudinary = (buffer, { folder, resourceType }) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, chunk_size: 6000000 },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

export const deleteFromCloudinary = (publicId, resourceType = 'video') =>
  publicId
    ? cloudinary.uploader.destroy(publicId, { resource_type: resourceType }).catch(() => {})
    : Promise.resolve();

// Auto-generate a thumbnail frame for a video when admin didn't upload one
export const autoThumbnail = (publicId) =>
  `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/so_0,w_800,h_450,c_fill/${publicId}.jpg`;

export default cloudinary;
