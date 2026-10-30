import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local fallback upload directory
const localUploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

const isAwsConfigured = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_REGION &&
  process.env.AWS_S3_BUCKET
);

let s3Client = null;
if (isAwsConfigured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  console.log(`☁️ [Amazon S3] Client initialized for bucket: ${process.env.AWS_S3_BUCKET} (${process.env.AWS_REGION})`);
} else {
  console.log('📦 [Amazon S3] AWS credentials not detected in .env. Uploads will use local static fallback and switch to S3 once credentials are added.');
}

export async function uploadImage(fileBuffer, mimeType, originalName, folder = 'backgrounds') {
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${folder}/${Date.now()}-${sanitizedName}`;

  if (isAwsConfigured && s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: filename,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await s3Client.send(command);

      const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
      return {
        url: s3Url,
        key: filename,
        storage: 'amazon-s3',
        bucket: process.env.AWS_S3_BUCKET,
      };
    } catch (err) {
      console.error('❌ [Amazon S3] Upload failed, falling back to local file storage:', err.message);
    }
  }

  // Fallback to local uploads
  const localFileName = `${Date.now()}-${sanitizedName}`;
  const localFilePath = path.join(localUploadsDir, localFileName);
  fs.writeFileSync(localFilePath, fileBuffer);

  const localUrl = `/uploads/${localFileName}`;
  return {
    url: localUrl,
    key: localFileName,
    storage: 'local-fallback',
    note: 'Configured for Amazon S3: Provide AWS credentials in server/.env to stream to AWS S3 directly.',
  };
}

export function getS3Status() {
  return {
    type: 'Amazon S3',
    configured: isAwsConfigured,
    bucket: process.env.AWS_S3_BUCKET || 'not-configured',
    region: process.env.AWS_REGION || 'not-configured',
  };
}

export default { uploadImage, getS3Status };
