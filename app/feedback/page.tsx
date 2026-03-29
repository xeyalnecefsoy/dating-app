"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { APP_FEEDBACK_CATEGORY_LABELS_AZ } from "@/lib/formatAz";

const CATEGORIES = Object.entries(APP_FEEDBACK_CATEGORY_LABELS_AZ).map(([id, label]) => ({
  id,
  label,
}));

export default function FeedbackPage() {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { isLoaded } = useAuth();
  const submitFeedback = useMutation(api.appFeedback.submitAppFeedback);

  const [category, setCategory] = useState<string>("bug");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (trimmed.length < 10) {
      showToast({
        type: "error",
        title: language === "az" ? "Çox qısa" : "Too short",
        message:
          language === "az"
            ? "Ən azı 10 simvol yazın."
            : "Please write at least 10 characters.",
      });
      return;
    }
    setSubmitting(true);
    try {
      let platform = "web";
      let appVersion = "";
      if (typeof navigator !== "undefined") {
        platform = navigator.userAgent.slice(0, 180);
      }
      await submitFeedback({
        category,
        message: trimmed,
        platform,
        appVersion: appVersion || undefined,
      });
      showToast({
        type: "success",
        title: language === "az" ? "Göndərildi" : "Sent",
        message:
          language === "az"
            ? "Təşəkkür edirik. Komanda məlumatı nəzərdən keçirəcək."
            : "Thank you. Our team will review this.",
      });
      setMessage("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast({
        type: "error",
        title: language === "az" ? "Xəta" : "Error",
        message: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const t =
    language === "az"
      ? {
          title: "Problem bildir",
          desc: "Nasazlıq, donma və ya digər texniki problemlər barədə qısa yazın. 24 saatda ən çox 5 bildiriş göndərə bilərsiniz.",
          category: "Kateqoriya",
          message: "Təsvir",
          placeholder:
            "Nə baş verir? Hansı səhifə/addım? Mümkünsə təkrarlama addımlarını yazın.",
          submit: "Göndər",
          signIn: "Daxil ol",
          signInHint: "Problem bildirmək üçün hesaba daxil olun.",
        }
      : {
          title: "Report a problem",
          desc: "Briefly describe bugs, lag, or other technical issues. You can send up to 5 reports per 24 hours.",
          category: "Category",
          message: "Details",
          placeholder:
            "What happens? Which screen? Steps to reproduce if possible.",
          submit: "Send",
          signIn: "Sign in",
          signInHint: "Sign in to send feedback.",
        };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">{t.title}</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {!isLoaded ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <SignedOut>
              <p className="text-muted-foreground text-sm mb-4">{t.signInHint}</p>
              <Link href="/sign-in">
                <Button className="w-full">{t.signIn}</Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.category}</label>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                        category === c.id
                          ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                          : "border-border bg-card hover:bg-muted/50"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.message}</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  placeholder={t.placeholder}
                  className="resize-none min-h-[160px]"
                  maxLength={4000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {message.trim().length}/4000
                </p>
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                disabled={submitting || message.trim().length < 10}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {t.submit}
              </Button>
            </SignedIn>
          </>
        )}
      </main>
    </div>
  );
}
