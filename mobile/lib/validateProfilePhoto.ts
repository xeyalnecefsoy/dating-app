import { getValidateProfilePhotoUrl } from "./siteUrl";

export async function validateProfilePhotoRemote(uri: string): Promise<{
  isValid: boolean;
  errorMessage?: string;
}> {
  const url = getValidateProfilePhotoUrl();
  const form = new FormData();
  form.append("file", {
    uri,
    name: "profile.jpg",
    type: "image/jpeg",
  } as any);

  try {
    const res = await fetch(url, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      return {
        isValid: false,
        errorMessage:
          "Şəkil serverdə yoxlanıla bilmədi. İnternetinizi yoxlayın və ya bir az sonra yenidən cəhd edin.",
      };
    }
    const data = (await res.json()) as {
      isValid?: boolean;
      errorMessage?: string;
    };
    return {
      isValid: !!data.isValid,
      errorMessage: data.errorMessage,
    };
  } catch {
    return {
      isValid: false,
      errorMessage:
        "Şəkil yoxlanıla bilmədi. İnternet bağlantınızı yoxlayıb yenidən cəhd edin.",
    };
  }
}
