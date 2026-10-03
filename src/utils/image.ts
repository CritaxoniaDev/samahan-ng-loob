export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

// Shrink a photo before upload (longest side ≤ maxSide). GIFs are kept as-is so they still move.
export async function prepareImage(file: File, maxSide = 1280): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if (file.type === 'image/gif') {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error('GIFs must be under 5 MB.');
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Safari can't encode WebP and quietly hands back a PNG; use JPEG there instead.
  const webp = await toBlob(canvas, 'image/webp', 0.85);
  const blob = webp?.type === 'image/webp' ? webp : await toBlob(canvas, 'image/jpeg', 0.85);
  if (!blob) throw new Error("Couldn't read that image.");
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error('That image is too large.');
  return blob;
}
