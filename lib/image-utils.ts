/**
 * Process a profile image:
 * 1. Load image
 * 2. Center crop to square aspect ratio
 * 3. Resize to maximum dimensions (e.g. 800x800)
 * 4. Convert to JPEG with compression
 */
export async function processProfileImage(
  file: File, 
  maxWidth: number = 800, 
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Calculate crop dimensions (square)
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = maxWidth;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw cropped and resized image
        // Draw from source (sx, sy, size, size) to destination (0, 0, maxWidth, maxWidth)
        ctx.drawImage(img, sx, sy, size, size, 0, 0, maxWidth, maxWidth);

        // Convert to Blob (JPEG)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = (error) => reject(error);
    };

    reader.onerror = (error) => reject(error);
  });
}
