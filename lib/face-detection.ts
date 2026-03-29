"use client";

import {
  averageBrightnessPercent,
  MAX_FACES_FOR_PROFILE,
  MIN_FACE_AREA_RATIO,
} from "./face-detection-rules";

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
let modelsLoaded = false;
let faceapi: any = null;

export async function loadFaceDetectionModels() {
  if (modelsLoaded && faceapi) return true;

  try {
    if (!faceapi) {
      faceapi = await import("face-api.js");
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

const VALIDATION_TIMEOUT_MS = 20000;

/**
 * Validates an image file for face detection, face size, single face, and brightness.
 */
export async function validateProfilePhoto(
  file: File
): Promise<FaceValidationResult> {
  const timeoutPromise = new Promise<FaceValidationResult>((resolve) => {
    setTimeout(() => {
      resolve({
        isValid: false,
        hasFace: false,
        isBright: false,
        errorMessage:
          "Şəkil yoxlanması çox uzun sürdü. Zəhmət olmasa daha kiçik şəkil seçin və ya yenidən cəhd edin.",
      });
    }, VALIDATION_TIMEOUT_MS);
  });

  const validationPromise = performValidation(file);
  return Promise.race([validationPromise, timeoutPromise]);
}

async function performValidation(file: File): Promise<FaceValidationResult> {
  try {
    const loadPromise = loadFaceDetectionModels();
    const loadTimeout = new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(false), 12000)
    );
    const loaded = await Promise.race([loadPromise, loadTimeout]);

    if (!loaded) {
      console.warn("Face models failed to load or timed out");
      return {
        isValid: false,
        hasFace: false,
        isBright: false,
        errorMessage:
          "Üz tanıma yüklənmədi. İnternet bağlantınızı yoxlayıb yenidən cəhd edin.",
      };
    }
  } catch {
    return {
      isValid: false,
      hasFace: false,
      isBright: false,
      errorMessage:
        "Üz tanıma başlatıla bilmədi. Səhifəni yeniləyib yenidən cəhd edin.",
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = async (e) => {
      img.src = e.target?.result as string;

      img.onload = async () => {
        try {
          if (!faceapi) {
            resolve({
              isValid: false,
              hasFace: false,
              isBright: false,
              errorMessage:
                "Üz yoxlaması hazır deyil. Səhifəni yeniləyib yenidən cəhd edin.",
            });
            return;
          }

          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;

          const detections = await faceapi.detectAllFaces(
            img,
            new faceapi.TinyFaceDetectorOptions()
          );
          const hasFace = detections.length > 0;

          const isBright = checkBrightness(img);

          if (!hasFace) {
            resolve({
              isValid: false,
              hasFace: false,
              isBright,
              errorMessage:
                "Şəkildə üz aşkarlanmadı. Zəhmət olmasa üzünüz aydın görünən bir şəkil seçin.",
            });
            return;
          }

          if (detections.length > MAX_FACES_FOR_PROFILE) {
            resolve({
              isValid: false,
              hasFace: true,
              isBright,
              errorMessage:
                "Yalnız özünüzün olduğu bir şəkil seçin (qrup şəkilləri qəbul edilmir).",
            });
            return;
          }

          const box = detections[0].box;
          const faceArea = box.width * box.height;
          const imageArea = w * h;
          if (faceArea / imageArea < MIN_FACE_AREA_RATIO) {
            resolve({
              isValid: false,
              hasFace: true,
              isBright,
              errorMessage:
                "Üz çox kiçik görünür və ya kadr keyfiyyətsizdir. Üzünüz daha yaxın və aydın olan selfie seçin (ekran/TV şəkli olmasın).",
            });
            return;
          }

          if (!isBright) {
            resolve({
              isValid: false,
              hasFace: true,
              isBright: false,
              errorMessage:
                "Şəkil çox qaranlıqdır. Zəhmət olmasa daha işıqlı bir şəkil seçin.",
            });
            return;
          }

          resolve({
            isValid: true,
            hasFace: true,
            isBright: true,
          });
        } catch (error) {
          console.error("Face detection error:", error);
          resolve({
            isValid: false,
            hasFace: false,
            isBright: false,
            errorMessage:
              "Şəkil yoxlanıla bilmədi. Başqa bir şəkil seçin və ya yenidən cəhd edin.",
          });
        }
      };

      img.onerror = () => {
        resolve({
          isValid: false,
          hasFace: false,
          isBright: false,
          errorMessage:
            "Şəkil yüklənə bilmədi. Başqa bir şəkil seçin.",
        });
      };
    };

    reader.onerror = () => {
      resolve({
        isValid: false,
        hasFace: false,
        isBright: false,
        errorMessage: "Fayl oxunarkən xəta baş verdi.",
      });
    };

    reader.readAsDataURL(file);
  });
}

function checkBrightness(img: HTMLImageElement): boolean {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const maxSize = 100;
  const scale = Math.min(maxSize / img.width, maxSize / img.height);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pct = averageBrightnessPercent(
    imageData.data,
    canvas.width,
    canvas.height
  );
  return pct >= 25;
}
