import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yyqleehgjrzqwwvmedrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cWxlZWhnanJ6cXd3dm1lZHJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDM5OTYsImV4cCI6MjA4NTExOTk5Nn0.nxgMKHAGw-Gbz3VksmjNFh9ZFLE2panJLsL2IN_UoPA';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads a file to the 'images' bucket in Supabase Storage.
 * @param file The file object to upload.
 * @param folder The folder path within the bucket (e.g., 'products', 'profiles').
 * @returns The public URL of the uploaded image or null if failed.
 */
export const uploadImage = async (file: File, folder: string = 'uploads'): Promise<string | null> => {
  try {
    // Sanitize filename and create a unique path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return null;
  }
};

/**
 * Compresses and resizes an image file to optimize upload speed and storage.
 * Limits dimension to 1024px and converts to JPEG with 0.7 quality.
 * @param file The original file.
 * @returns A Promise resolving to the compressed File.
 */
export const compressImage = async (file: File): Promise<File> => {
  // If not an image, return original
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        // Resize logic
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File(
                [blob], 
                file.name.replace(/\.[^/.]+$/, "") + ".jpg", 
                {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                }
              );
              resolve(newFile);
            } else {
              resolve(file); // Fallback to original if compression fails
            }
          },
          'image/jpeg',
          0.7 // Quality 70%
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};