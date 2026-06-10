import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Safely initialize Supabase. If credentials are empty, the app falls back to localStorage.
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Helper to upload an outfit image base64 file to Supabase Storage bucket.
 * Bucket name: "outfits"
 */
export async function uploadOutfitImage(base64Data, filename) {
  if (!supabase) throw new Error("Supabase is not initialized.");
  
  try {
    // Convert base64 to binary blob
    const response = await fetch(base64Data);
    const blob = await response.blob();
    
    // Upload file
    const fileExt = filename.split('.').pop() || 'jpg';
    const filePath = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from("outfits")
      .upload(filePath, blob, {
        cacheControl: "3600",
        upsert: false,
        contentType: blob.type
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("outfits")
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (err) {
    console.error("Supabase storage upload error:", err);
    throw err;
  }
}
