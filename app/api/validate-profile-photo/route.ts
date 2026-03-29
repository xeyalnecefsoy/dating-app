import { NextResponse } from "next/server";
import { validateProfilePhotoBuffer } from "@/lib/face-detection-server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST multipart/form-data with field "file" — used by mobile onboarding for face checks
 * (same rules as web lib/face-detection.ts).
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { isValid: false, errorMessage: "Fayl göndərilməyib." },
        { status: 400 }
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length < 100) {
      return NextResponse.json({
        isValid: false,
        errorMessage: "Şəkil faylı çox kiçikdir.",
      });
    }
    const result = await validateProfilePhotoBuffer(buf);
    return NextResponse.json(result);
  } catch (e) {
    console.error("validate-profile-photo:", e);
    return NextResponse.json(
      {
        isValid: false,
        errorMessage:
          "Şəkil yoxlanıla bilmədi. Bir az sonra yenidən cəhd edin.",
      },
      { status: 500 }
    );
  }
}
