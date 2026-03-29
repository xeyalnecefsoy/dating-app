/**
 * Shared profile validation (onboarding / profile save).
 * Used by web, mobile, and mirrored in Convex users.createOrUpdateUser.
 */

export const BIO_MIN_LENGTH = 40;
export const BIO_MIN_WORDS = 3;

const AZ_LOCALE = "az-AZ";

/** Each whitespace-separated word must be title-case (Azərbaycan latın). */
export function isTitleCaseWord(word: string): boolean {
  const w = word.trim();
  if (w.length === 0) return false;
  const first = w[0];
  const rest = w.slice(1);
  return (
    first === first.toLocaleUpperCase(AZ_LOCALE) &&
    rest === rest.toLocaleLowerCase(AZ_LOCALE)
  );
}

export function validateFullName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Ad və soyad daxil edin.";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return "Ad və soyadı ayrı-ayrı sözlərlə yazın (hər sözün ilk hərfi böyük olmalıdır).";
  }
  for (const p of parts) {
    if (!isTitleCaseWord(p)) {
      return "Ad və soyadda hər sözün ilk hərfi böyük, qalanı kiçik olmalıdır (məs: Ulvi Əzərli).";
    }
  }
  return null;
}

/** Words = segments split by whitespace */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

/** True if bio has too few meaningful letters/digits (only dots etc.) */
function isOnlyPunctuationBio(bio: string): boolean {
  const letters = bio.replace(/[^a-zA-ZəğıöüçşıƏĞIİÖÜÇŞ0-9]/g, "");
  return letters.length < 5;
}

export function validateBio(bio: string): string | null {
  const trimmed = bio.trim();
  if (!trimmed) return "Açıqlama boş ola bilməz.";
  if (isOnlyPunctuationBio(trimmed)) {
    return "Açıqlama yalnız durğu işarələrindən ibarət ola bilməz; özünüz haqqında bir neçə cümlə yazın.";
  }
  if (countWords(trimmed) < BIO_MIN_WORDS) {
    return `Açıqlama ən azı ${BIO_MIN_WORDS} sözdən ibarət olmalıdır.`;
  }
  if (trimmed.length < BIO_MIN_LENGTH) {
    return `Açıqlama ən azı ${BIO_MIN_LENGTH} simvol olmalıdır.`;
  }
  return null;
}

export function validateProfileForSave(name: string, bio: string | undefined): string | null {
  const nameErr = validateFullName(name);
  if (nameErr) return nameErr;
  if (bio !== undefined) {
    return validateBio(bio);
  }
  return null;
}
