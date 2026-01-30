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
