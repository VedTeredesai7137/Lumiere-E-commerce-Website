const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.Cloud_Name,
  api_key: process.env.Cloud_API_Key,
  api_secret: process.env.Cloud_API_Key_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Jwellery_dev',
    allowedFormats: ['jpeg', 'png', 'jpg'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

module.exports = { cloudinary, storage };
