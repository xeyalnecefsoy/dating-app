"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Only create client if URL is available (prevents build errors on Vercel if env not set)
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

// Azerbaijani localization for Clerk
const azLocalization = {
  socialButtonsBlockButton: "{{provider}} ilə davam et",
  dividerText: "və ya",
  formFieldLabel__emailAddress: "E-poçt ünvanı",
  formFieldLabel__password: "Şifrə",
  formFieldLabel__confirmPassword: "Şifrəni təsdiqlə",
  formFieldLabel__firstName: "Ad",
  formFieldLabel__lastName: "Soyad",
  formButtonPrimary: "Davam et",
  signIn: {
    start: {
      title: "Daxil olun",
      subtitle: "Hesabınıza daxil olmaq üçün",
      actionText: "Hesabınız yoxdur?",
      actionLink: "Qeydiyyatdan keçin",
    },
    password: {
      title: "Şifrənizi daxil edin",
      subtitle: "{{identifier}} üçün şifrənizi daxil edin",
      actionLink: "Başqa üsuldan istifadə edin",
    },
    forgotPasswordAlternativeMethods: {
      title: "Şifrənizi unutmusunuz?",
      label__alternativeMethods: "Və ya başqa üsulla daxil olun",
      blockButton__resetPassword: "Şifrəni sıfırla",
    },
  },
  signUp: {
    start: {
      title: "Qeydiyyatdan keçin",
      subtitle: "Danyeri-yə qoşulmaq üçün",
      actionText: "Artıq hesabınız var?",
      actionLink: "Daxil olun",
    },
    emailLink: {
      title: "E-poçtunuzu təsdiqləyin",
      subtitle: "Davam etmək üçün {{applicationName}}",
      formTitle: "Təsdiq linki",
      formSubtitle: "E-poçtunuza göndərilən təsdiq linkindən istifadə edin",
      resendButton: "Link almadınız? Yenidən göndər",
      verified: {
        title: "Uğurla qeydiyyatdan keçdiniz",
      },
    },
  },
  userButton: {
    action__manageAccount: "Hesabı idarə et",
    action__signOut: "Çıxış",
  },
};

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  // If Convex is not configured, just use ClerkProvider
  if (!convex) {
    console.warn("Convex URL not configured. Running with Clerk only.");
    return (
      <ClerkProvider
        localization={azLocalization}
        appearance={{
          variables: {
            colorPrimary: "#f43f5e",
            colorBackground: "#0a0a0f",
            colorText: "#ffffff",
            colorTextSecondary: "#a1a1aa",
            borderRadius: "0.75rem",
          },
        }}
      >
        {children}
      </ClerkProvider>
    );
  }

  return (
    <ClerkProvider
      localization={azLocalization}
      appearance={{
        variables: {
          colorPrimary: "#f43f5e",
          colorBackground: "#0a0a0f",
          colorText: "#ffffff",
          colorTextSecondary: "#a1a1aa",
          borderRadius: "0.75rem",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
