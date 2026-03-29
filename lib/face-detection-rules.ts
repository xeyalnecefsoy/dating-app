/** Shared thresholds for client + server profile photo checks — keep in sync. */

export const MIN_FACE_AREA_RATIO = 0.04;
export const MAX_FACES_FOR_PROFILE = 1;

export function averageBrightnessPercent(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  let totalBrightness = 0;
  const pixelCount = width * height;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    totalBrightness += brightness;
  }
  return (totalBrightness / pixelCount / 255) * 100;
}
