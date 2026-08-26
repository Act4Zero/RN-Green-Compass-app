import * as ImageManipulator from 'expo-image-manipulator';
import type { ImagePickerAsset } from 'expo-image-picker';
import supabase from '@/lib/supabase';

const MAX_SOURCE_BYTES = 8 * 1024 * 1024;

function randomName(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}.jpg`;
}

/** Re-encoding strips source EXIF (including embedded GPS) before upload. */
export async function uploadSustainabilityPhoto(userId: string, locationId: string, asset: ImagePickerAsset, altText: string): Promise<void> {
  if (asset.fileSize && asset.fileSize > MAX_SOURCE_BYTES) throw new Error('Photo must be 8 MB or smaller.');
  if (!asset.mimeType?.startsWith('image/') && !/\.(jpe?g|png|webp)$/i.test(asset.uri)) throw new Error('Choose a JPEG, PNG or WebP image.');
  const processed = await ImageManipulator.manipulateAsync(asset.uri, [{ resize: { width: 1600 } }], { compress: 0.78, format: ImageManipulator.SaveFormat.JPEG });
  const response = await fetch(processed.uri);
  if (!response.ok) throw new Error('Unable to prepare this photo.');
  const blob = await response.blob();
  if (blob.size > MAX_SOURCE_BYTES) throw new Error('Processed photo is still larger than 8 MB.');
  const path = `${userId}/${locationId}/${randomName()}`;
  const { error: uploadError } = await supabase.storage.from('sustainability-media').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (uploadError) throw new Error(uploadError.message || 'Unable to upload this photo.');
  const { error: recordError } = await (supabase as any).from('sustainability_media').insert({ location_id: locationId, user_id: userId, storage_path: path, alt_text: altText.trim().slice(0,300), status: 'pending' });
  if (recordError) {
    await supabase.storage.from('sustainability-media').remove([path]);
    throw new Error(recordError.message || 'Unable to submit this photo.');
  }
}
