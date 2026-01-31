import { createClient } from '@supabase/supabase-js';
import { MenuItem, Order } from '../types';

// Use environment variables injected via vite.config.ts define
// We use process.env here because we defined 'process.env.VITE_SUPABASE_URL' in vite.config.ts
// to be replaced by the string value at build time.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yyqleehgjrzqwwvmedrl.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cWxlZWhnanJ6cXd3dm1lZHJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDM5OTYsImV4cCI6MjA4NTExOTk5Nn0.nxgMKHAGw-Gbz3VksmjNFh9ZFLE2panJLsL2IN_UoPA';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- Existing Image Functions (Preserved for App compatibility) ---

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

// --- New Data Functions (Requested) ---

// Get all menu items
export const getMenuItems = async (): Promise<MenuItem[]> => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*');
  
  if (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
  
  return (data as any) || [];
};

// Get menu items by category
export const getMenuItemsByCategory = async (category: string): Promise<MenuItem[]> => {
  if (category === 'all') {
    return getMenuItems();
  }
  
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('category', category);
  
  if (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
  
  return (data as any) || [];
};

// Create new order
export const createOrder = async (order: Omit<Order, 'id'>): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating order:', error);
    return null;
  }
  
  return data as any;
};

// Get all orders
export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  
  return (data as any) || [];
};

// Get products (Note: Assuming 'products' table exists, distinct from menu_items?)
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data || [];
};

// Get slider items
export const getSliderItems = async () => {
  const { data, error } = await supabase
    .from('slider_items')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching slider items:', error);
    return [];
  }
  
  return data || [];
};