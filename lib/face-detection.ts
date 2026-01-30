"use client";

import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
let modelsLoaded = false;

export async function loadFaceDetectionModels() {
  if (modelsLoaded) return true;
  
  try {
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
  // Load models if not already loaded
  const loaded = await loadFaceDetectionModels();
  if (!loaded) {
    return {
      isValid: false,
      hasFace: false,
      isBright: false,
      errorMessage: "Üz aşkarlama sistemi yüklənə bilmədi. Zəhmət olmasa yenidən cəhd edin."
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = async (e) => {
      img.src = e.target?.result as string;
      
      img.onload = async () => {
        try {
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
          resolve({
            isValid: false,
            hasFace: false,
            isBright: false,
            errorMessage: "Şəkil yoxlanarkən xəta baş verdi. Yenidən cəhd edin."
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
