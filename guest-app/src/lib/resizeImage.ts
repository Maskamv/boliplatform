/**
 * Downscales an image file to a small square JPEG and returns it as a data:
 * URL, so avatars can be sent to the backend as plain JSON without any
 * upload/storage infrastructure. Keeps payloads well under the backend's
 * cap (~500KB) — a 256px JPEG at 0.8 quality is typically 10-30KB.
 */
export function resizeImageToDataUrl(file: File, maxSize = 256, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image"));
    };

    img.src = objectUrl;
  });
}
