/** Copy for community standards step + photo rules (AZ / EN) — web + mobile. */

import { BIO_MIN_LENGTH, BIO_MIN_WORDS } from "./profileValidation";

export function communityStandardsSummaryAz(bioMin: number = BIO_MIN_LENGTH, minWords: number = BIO_MIN_WORDS) {
  return [
    "Danyeri ciddi tanışlıq üçündür: real şəxsiyyət, düzgün məlumat, qarşılıqlı hörmət.",
    `Ad və soyad hər sözün ilk hərfi böyük olmaqla düzgün yazılmalıdır; bio ən azı ${minWords} söz və ${bioMin} simvol, özünüz haqqında məlumat verməlidir.`,
    "Profil şəkli sizə aid, üzünüz aydın görünən selfie olmalıdır; siqaret/elektron siqaret təbliği, TV/ekran/aktyor şəkli və qrup kadrları qəbul edilmir.",
    "Yalan və ya təhqiredici məlumatlar hesabın rəddinə və ya bloklanmasına səbəb ola bilər.",
  ];
}

export function communityStandardsSummaryEn(bioMin: number = BIO_MIN_LENGTH, minWords: number = BIO_MIN_WORDS) {
  return [
    "Danyeri is for serious dating: real identity, accurate information, mutual respect.",
    `First and last name must use proper capitalization; your bio must be at least ${minWords} words and ${bioMin} characters and say something real about you.`,
    "Your profile photo must be yours, with a clear face — no tobacco/vaping promotion, no TV/screen/actor shots, no group photos as the main picture.",
    "False or abusive information can lead to rejection or a ban.",
  ];
}

export const photoRulesAz = [
  "Özünüzə aid, üzünüz aydın görünən selfie (başqalarının və ya ekrandan çəkilmiş şəkil yox).",
  "Siqaret, elektron siqaret və ya aqressiv təsvirlər tövsiyə olunmur; moderator rədd edə bilər.",
  "TV/monitor/kinodan çəkilmiş kadrlar qəbul edilmir.",
  "Yaxşı işıq, tək üz — qrup şəkilləri əsas profil üçün uyğun deyil.",
];

export const photoRulesEn = [
  "A clear selfie that is yours — not someone else’s face or a photo of a screen.",
  "Tobacco/vaping and aggressive imagery are not appropriate; moderators may reject.",
  "Photos of a TV/monitor/movie scene are not allowed.",
  "Good lighting, one face — group shots are not suitable as the main profile photo.",
];
