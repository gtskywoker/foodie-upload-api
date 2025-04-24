require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const multer      = require('multer');
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
    api_key:     process.env.API_KEY,
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
app.post('/upload-image', upload.single('file'), async (req, res) => {
    const requestStartTime = Date.now();
    const requestTimestamp = new Date().toISOString();
    console.log(`[${requestTimestamp}] Request received for /upload-image`);

    if (!req.file) {
        const errorTimestamp = new Date().toISOString();
        console.error(`[${errorTimestamp}] No file uploaded`);
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileSize = req.file.size;
    console.log(`[${requestTimestamp}] File uploaded (size: ${fileSize} bytes)`);

    try {
        const uploadStartTime = Date.now();
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'foodie/products' });
        const uploadEndTime = Date.now();
        const uploadDuration = uploadEndTime - uploadStartTime;
        const uploadTimestamp = new Date().toISOString();
        console.log(`[${uploadTimestamp}] Image uploaded to Cloudinary in ${uploadDuration}ms. Secure URL: ${result.secure_url}`);

        const responseTime = Date.now() - requestStartTime;
        const responseTimestamp = new Date().toISOString();
        console.log(`[${responseTimestamp}] Response sent for /upload-image in ${responseTime}ms`);

        res.json({
            message: 'Image uploaded successfully',
            secure_url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (error) {
        const errorTimestamp = new Date().toISOString();
        console.error(`[${errorTimestamp}] Error uploading to Cloudinary: ${error}`);
        res.status(500).json({ message: 'Error uploading image' });
    }
});

// ตัวอย่าง Route อื่น (ถ้ามี)
app.get('/ping', (req, res) => res.send('pong'));

// เริ่ม server
app.listen(PORT, () => {
    console.log(`🚀 Upload API running on port ${PORT}`);
});