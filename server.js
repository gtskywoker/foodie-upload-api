require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const multer   = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// อ่าน PORT จาก env (Render จะตั้งให้)
const PORT = process.env.PORT || 3000;

// เปิด CORS ให้ทุกที่มาเรียกได้ (ปรับ domain เฉพาะถ้าต้องการเข้มงวด)
app.use(cors());
app.use(express.json());

// ตั้งค่า Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key:    process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// สร้าง storage ให้ multer ใช้งาน
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'foodie/products',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

// Route: upload ภาพ
app.post('/upload-image', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    message:    'Image uploaded successfully',
    secure_url: req.file.path || req.file.secure_url, // multer-storage-cloudinary เก็บไว้ path
    public_id:  req.file.filename || req.file.public_id,
  });
});

// ตัวอย่าง Route อื่น (ถ้ามี)
app.get('/ping', (req, res) => res.send('pong'));

// เริ่ม server
app.listen(PORT, () => {
  console.log(`🚀 Upload API running on port ${PORT}`);
});
