require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const multerStorageCloudinary = require('multer-storage-cloudinary').CloudinaryStorage;

const app = express();
const port = 3000;

// กำหนดค่า Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// กำหนด Storage สำหรับ multer
const storage = new multerStorageCloudinary({
  cloudinary: cloudinary,
  params: {
    folder: 'foodie/products',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  }
});

// ใช้ multer สำหรับการอัปโหลดไฟล์
const upload = multer({ storage: storage });

// API สำหรับอัปโหลดรูปภาพ
app.post('/upload-image', upload.single('file'), (req, res) => {
  try {
    if (req.file) {
      res.status(200).json({
        message: 'Image uploaded successfully!',
        secure_url: req.file.secure_url,
        public_id: req.file.public_id
      });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// เริ่มต้น API server
app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
