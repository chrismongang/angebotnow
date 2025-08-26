import { v2 as cloudinary } from "cloudinary";

// Check if environment variables are set
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Cloudinary configuration missing:', {
    cloudName: !!cloudName,
    apiKey: !!apiKey,
    apiSecret: !!apiSecret
  });
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export { cloudinary };

export async function uploadImage(file: File | ArrayBuffer): Promise<{
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}> {
  try {
    console.log('Starting Cloudinary upload...');
    
    let buffer: Buffer;
    
    if (file instanceof File) {
      console.log('File type:', file.type);
      console.log('File size:', file.size);
      
      // Convert File to Buffer
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    } else {
      // Already ArrayBuffer
      buffer = Buffer.from(file);
    }
    
    console.log('Buffer size:', buffer.length);
    
    // Convert to base64
    const base64String = buffer.toString("base64");
    const dataURI = `data:image/jpeg;base64,${base64String}`;
    
    console.log('Data URI length:', dataURI.length);
    
    // Upload to Cloudinary with optimized transformation
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "angebotnow",
      resource_type: "image",
      transformation: [
        { width: 1200, height: 800, crop: "limit" },
        { quality: "auto:good" },
        { format: "auto" }
      ],
      eager: [
        { width: 400, height: 300, crop: "fill", quality: "auto" },
        { width: 800, height: 600, crop: "limit", quality: "auto" }
      ],
      eager_async: true,
      eager_notification_url: process.env.CLOUDINARY_WEBHOOK_URL,
    });
    
    console.log('Cloudinary upload successful:', result.secure_url);
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bild-Upload fehlgeschlagen",
    };
  }
}

export async function deleteImage(publicId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary not configured');
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('Image deleted successfully:', publicId);
      return { success: true };
    } else {
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bild-Löschung fehlgeschlagen",
    };
  }
}

export function getOptimizedImageUrl(publicId: string, options: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
} = {}): string {
  const { width = 800, height = 600, quality = 'auto', format = 'auto' } = options;
  
  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop: 'limit' },
      { quality },
      { format }
    ]
  });
}
