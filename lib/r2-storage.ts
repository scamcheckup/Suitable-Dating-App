import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface R2UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

const R2_CONFIG = {
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT || 'https://9d2eb2fd25f9efcacc12fea2ba99fb32.r2.cloudflarestorage.com',
  bucket: process.env.EXPO_PUBLIC_R2_BUCKET || 'suitable-images',
  accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY || '3b7998f755cad1c16c84bbd8b9a4b6d9',
  secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_KEY || '5924cdba3ec56c495468255855e7dbcba47d0786adb688b997b3410d85fb1fe7',
  region: 'auto', // Cloudflare R2 uses 'auto' region
};

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  endpoint: R2_CONFIG.endpoint,
  region: R2_CONFIG.region,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
  forcePathStyle: true, // Required for R2
});

// Compress image before upload
const compressImage = async (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const uploadProfilePhotoToR2 = async (
  file: File | Blob,
  userId: string,
  photoIndex: number
): Promise<R2UploadResponse> => {
  try {
    // Compress image if it's a File
    let processedFile = file;
    if (file instanceof File) {
      processedFile = await compressImage(file);
    }

    const fileName = `profile-photos/${userId}/${Date.now()}_${photoIndex}.jpg`;
    
    // Convert blob to array buffer
    const arrayBuffer = await processedFile.arrayBuffer();
    
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: fileName,
      Body: new Uint8Array(arrayBuffer),
      ContentType: 'image/jpeg',
      CacheControl: 'public, max-age=31536000', // 1 year cache
    });

    await s3Client.send(command);
    
    const photoUrl = `${R2_CONFIG.endpoint}/${fileName}`;
    
    return {
      success: true,
      url: photoUrl,
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

export const deleteProfilePhotoFromR2 = async (photoUrl: string): Promise<boolean> => {
  try {
    // Extract the key from the URL
    const key = photoUrl.replace(`${R2_CONFIG.endpoint}/`, '');
    
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('R2 delete error:', error);
    return false;
  }
};

// Generate presigned URL for secure uploads (alternative method)
export const generatePresignedUploadUrl = async (
  userId: string,
  photoIndex: number
): Promise<{ uploadUrl: string; photoUrl: string } | null> => {
  try {
    const fileName = `profile-photos/${userId}/${Date.now()}_${photoIndex}.jpg`;
    
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: fileName,
      ContentType: 'image/jpeg',
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    const photoUrl = `${R2_CONFIG.endpoint}/${fileName}`;
    
    return { uploadUrl, photoUrl };
  } catch (error) {
    console.error('Presigned URL generation error:', error);
    return null;
  }
};

// Retry logic for failed uploads
export const uploadWithRetry = async (
  file: File | Blob,
  userId: string,
  photoIndex: number,
  maxRetries: number = 3
): Promise<R2UploadResponse> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await uploadProfilePhotoToR2(file, userId, photoIndex);
      if (result.success) {
        return result;
      }
      lastError = new Error(result.error || 'Upload failed');
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  return {
    success: false,
    error: `Upload failed after ${maxRetries} attempts: ${lastError?.message}`,
  };
};