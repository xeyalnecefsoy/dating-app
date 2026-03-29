/**
 * Server-only profile photo validation (Node canvas + face-api.js).
 * Lazy-init: face-api monkeyPatch runs only inside validateProfilePhotoBuffer so Next.js
 * build does not execute it at module load.
 */

import { createCanvas, loadImage } from "canvas";
import * as canvasLib from "canvas";
import {
  averageBrightnessPercent,
  MAX_FACES_FOR_PROFILE,
  MIN_FACE_AREA_RATIO,
} from "./face-detection-rules";

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

let modelsLoaded = false;
let faceapiMod: typeof import("face-api.js") | null = null;

async function ensureFaceApi(): Promise<typeof import("face-api.js")> {
  if (!faceapiMod) {
    faceapiMod = await import("face-api.js");
    faceapiMod.env.monkeyPatch({
      Canvas: canvasLib.Canvas as any,
      Image: canvasLib.Image as any,
      ImageData: canvasLib.ImageData as any,
    });
  }
  if (!modelsLoaded) {
    await faceapiMod.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    modelsLoaded = true;
  }
  return faceapiMod;
}

export interface ServerFaceValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export async function validateProfilePhotoBuffer(
  buffer: Buffer
): Promise<ServerFaceValidationResult> {
  let faceapi: typeof import("face-api.js");
  try {
    faceapi = await ensureFaceApi();
  } catch (e) {
    console.error("face-api init failed:", e);
    return {
      isValid: false,
      errorMessage:
        "Şəkil yoxlanıla bilmədi. İnternet bağlantınızı yoxlayıb yenidən cəhd edin.",
    };
  }

  let img: InstanceType<typeof canvasLib.Image>;
  try {
    img = await loadImage(buffer);
  } catch {
    return {
      isValid: false,
      errorMessage: "Şəkil oxuna bilmədi. Başqa fayl seçin.",
    };
  }

  const w = img.width;
  const h = img.height;
  const canvas = createCanvas(w, h);
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) {
    return { isValid: false, errorMessage: "Şəkil işlənə bilmədi." };
  }
  ctx2d.drawImage(img, 0, 0);

  const maxSize = 400;
  const scale = Math.min(maxSize / w, maxSize / h, 1);
  const sw = Math.max(1, Math.floor(w * scale));
  const sh = Math.max(1, Math.floor(h * scale));
  const small = createCanvas(sw, sh);
  const sctx = small.getContext("2d");
  if (!sctx) {
    return { isValid: false, errorMessage: "Şəkil işlənə bilmədi." };
  }
  sctx.drawImage(canvas, 0, 0, sw, sh);
  const imageData = sctx.getImageData(0, 0, sw, sh);
  const bright = averageBrightnessPercent(imageData.data, sw, sh);
  if (bright < 25) {
    return {
      isValid: false,
      errorMessage:
        "Şəkil çox qaranlıqdır. Zəhmət olmasa daha işıqlı bir şəkil seçin.",
    };
  }

  const detections = await faceapi.detectAllFaces(
    canvas as unknown as HTMLCanvasElement,
    new faceapi.TinyFaceDetectorOptions()
  );

  if (detections.length === 0) {
    return {
      isValid: false,
      errorMessage:
        "Şəkildə üz aşkarlanmadı. Zəhmət olmasa üzünüz aydın görünən bir şəkil seçin.",
    };
  }

  if (detections.length > MAX_FACES_FOR_PROFILE) {
    return {
      isValid: false,
      errorMessage:
        "Yalnız özünüzün olduğu bir şəkil seçin (qrup şəkilləri qəbul edilmir).",
    };
  }

  const box = detections[0].box;
  const faceArea = box.width * box.height;
  const imageArea = w * h;
  const ratio = faceArea / imageArea;
  if (ratio < MIN_FACE_AREA_RATIO) {
    return {
      isValid: false,
      errorMessage:
        "Üz çox kiçik görünür və ya kadr keyfiyyətsizdir. Üzünüz daha yaxın və aydın olan selfie seçin (ekran/TV şəkli olmasın).",
    };
  }

  return { isValid: true };
}
