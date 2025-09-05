import { supabase } from './supabase';
import { uploadProfilePhotoToR2, deleteProfilePhotoFromR2 } from './r2-storage';

export const uploadProfilePhoto = async (userId: string, file: File | Blob, isPrimary: boolean = false): Promise<{ url: string | null; error: any }> => {
  try {
    // Upload to R2 (for profile photos only)
    const photoIndex = isPrimary ? 0 : Date.now();
    const { success, url, error } = await uploadProfilePhotoToR2(file, userId, photoIndex);
    
    if (!success || !url) {
      throw new Error(error || 'Failed to upload to R2');
    }

    // Update user's profile photos array in database
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('profile_photos')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const currentPhotos = currentUser.profile_photos || [];
    const updatedPhotos = isPrimary ? [url, ...currentPhotos] : [...currentPhotos, url];

    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_photos: updatedPhotos })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { url, error: null };
  } catch (error) {
    return { url: null, error };
  }
};

export const uploadVerificationPhoto = async (userId: string, file: File | Blob): Promise<{ url: string | null; error: any }> => {
  try {
    // Upload verification photos to Supabase storage (not R2)
    const timestamp = Date.now();
    const fileName = `${userId}_verification_${timestamp}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('verification-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('verification-photos')
      .getPublicUrl(fileName);

    // Update user's verification photo URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        verification_photo_url: publicUrl,
        verification_status: 'pending'
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { url: publicUrl, error: null };
  } catch (error) {
    return { url: null, error };
  }
};

export const deletePhoto = async (photoUrl: string, userId: string): Promise<{ success: boolean; error: any }> => {
  try {
    // Check if it's an R2 URL (profile photo) or Supabase URL (verification photo)
    const isR2Photo = photoUrl.includes('r2.cloudflarestorage.com');
    
    if (isR2Photo) {
      // Delete from R2
      const deleteSuccess = await deleteProfilePhotoFromR2(photoUrl);
      if (!deleteSuccess) {
        throw new Error('Failed to delete from R2');
      }
    } else {
      // Delete from Supabase storage
      const fileName = photoUrl.split('/').pop();
      if (fileName) {
        const { error } = await supabase.storage
          .from('verification-photos')
          .remove([fileName]);
        
        if (error) throw error;
      }
    }

    // Remove from user's profile photos array
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('profile_photos')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const currentPhotos = currentUser.profile_photos || [];
    const updatedPhotos = currentPhotos.filter(photo => photo !== photoUrl);

    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_photos: updatedPhotos })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};