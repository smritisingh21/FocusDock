import express from 'express';
import multer from 'multer';
import { getPreferences, updatePreferences, uploadBackground } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage before S3 streaming
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are permitted'));
    }
  },
});

router.use(authenticateToken);

router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.post('/background', upload.single('image'), uploadBackground);

export default router;
