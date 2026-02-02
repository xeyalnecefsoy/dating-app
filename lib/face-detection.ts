"use client";

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
let modelsLoaded = false;
let faceapi: any = null;

export async function loadFaceDetectionModels() {
  if (modelsLoaded && faceapi) return true;
  
  try {
    // Dynamic import to prevent ChunkLoadError on initial load
    if (!faceapi) {
        faceapi = await import('face-api.js');
    }

    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    modelsLoaded = true;
    console.log("Face detection models loaded successfully");
    return true;
  } catch (error) {
    console.error("Failed to load face detection models:", error);
    return false;
  }
}

export interface FaceValidationResult {
  isValid: boolean;
  hasFace: boolean;
  isBright: boolean;
  errorMessage?: string;
}

/**
 * Validates an image file for face detection and brightness.
 * @param file - The image file to validate
 * @returns A FaceValidationResult object
 */
export async function validateProfilePhoto(file: File): Promise<FaceValidationResult> {
  // Create a timeout promise (15 seconds max)
  const timeoutPromise = new Promise<FaceValidationResult>((resolve) => {
    setTimeout(() => {
      resolve({
        isValid: true, // Accept photo if timeout
        hasFace: true,
        isBright: true,
        errorMessage: undefined
      });
    }, 15000);
  });

  // Create the actual validation promise
  const validationPromise = performValidation(file);

  // Race between validation and timeout
  return Promise.race([validationPromise, timeoutPromise]);
}

async function performValidation(file: File): Promise<FaceValidationResult> {
  // Load models if not already loaded (with its own timeout)
  try {
    const loadPromise = loadFaceDetectionModels();
    const loadTimeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 10000));
    const loaded = await Promise.race([loadPromise, loadTimeout]);
    
    if (!loaded) {
      // Model load failed/timed out - accept photo anyway
      console.warn("Face models failed to load, accepting photo without validation");
      return {
        isValid: true,
        hasFace: true,
        isBright: true
      };
    }
  } catch {
    return {
      isValid: true,
      hasFace: true,
      isBright: true
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = async (e) => {
      img.src = e.target?.result as string;
      
      img.onload = async () => {
        try {
          // Ensure faceapi is loaded
          if (!faceapi) {
             console.warn("FaceAPI not loaded during validation, skipping check");
             resolve({ isValid: true, hasFace: true, isBright: true });
             return;
          }

          // 1. Check for face
          const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());
          const hasFace = detections.length > 0;

          // 2. Check brightness
          const isBright = checkBrightness(img);

          if (!hasFace) {
            resolve({
              isValid: false,
              hasFace: false,
              isBright,
              errorMessage: "Şəkildə üz aşkarlanmadı. Zəhmət olmasa üzünüz aydın görünən bir şəkil seçin."
            });
            return;
          }

          if (!isBright) {
            resolve({
              isValid: false,
              hasFace: true,
              isBright: false,
              errorMessage: "Şəkil çox qaranlıqdır. Zəhmət olmasa daha işıqlı bir şəkil seçin."
            });
            return;
          }

          resolve({
            isValid: true,
            hasFace: true,
            isBright: true
          });

        } catch (error) {
          console.error("Face detection error:", error);
          // On error, accept photo
          resolve({
            isValid: true,
            hasFace: true,
            isBright: true
          });
        }
      };

      img.onerror = () => {
        resolve({
          isValid: false,
          hasFace: false,
          isBright: false,
          errorMessage: "Şəkil yüklənə bilmədi. Başqa bir şəkil seçin."
        });
      };
    };

    reader.onerror = () => {
      resolve({
        isValid: false,
        hasFace: false,
        isBright: false,
        errorMessage: "Fayl oxunarkən xəta baş verdi."
      });
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Checks if an image is too dark by calculating average brightness.
 * Returns true if the image is bright enough.
 */
function checkBrightness(img: HTMLImageElement): boolean {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return true; // Fallback: assume bright

  // Use smaller canvas for performance
  const maxSize = 100;
  const scale = Math.min(maxSize / img.width, maxSize / img.height);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let totalBrightness = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    // Calculate perceived brightness using weighted RGB
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Human eye is more sensitive to green
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    totalBrightness += brightness;
  }

  const avgBrightness = totalBrightness / pixelCount;
  const brightnessPercent = (avgBrightness / 255) * 100;

  // Threshold: 25% minimum brightness
  return brightnessPercent >= 25;
}
