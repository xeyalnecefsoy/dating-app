import React, { useState } from "react";
import { X, AlertTriangle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/toast";

interface ReportModalProps {
  reportedId: string;
  reportedName: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  { id: "fake", label: { az: "Saxta profil", en: "Fake profile" } },
  { id: "harassment", label: { az: "Qısnama / Narahat etmə", en: "Harassment" } },
  { id: "inappropriate", label: { az: "Uyğunsuz məzmun", en: "Inappropriate content" } },
  { id: "spam", label: { az: "Spam və ya reklam", en: "Spam or scam" } },
  { id: "other", label: { az: "Digər", en: "Other" } },
];

export function ReportModal({ reportedId, reportedName, onClose }: ReportModalProps) {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = useMutation(api.reports.submitReport);

  const handleSubmit = async () => {
    if (!reason) return;
    
    setIsSubmitting(true);
    try {
      await submitReport({
        reportedId,
        reason,
        description: description.trim() || undefined,
      });

      showToast({
        type: "success",
        title: language === 'az' ? 'Şikayət qəbul edildi' : 'Report submitted',
        message: language === 'az' 
          ? 'Bildirdiyiniz üçün təşəkkürlər. Komandamız ən qısa zamanda baxacaq.' 
          : 'Thank you for reporting. Our team will review this shortly.',
      });
      onClose();
    } catch (error: any) {
      showToast({
        type: "error",
        title: language === 'az' ? 'Xəta baş verdi' : 'Error',
        message: error.message || (language === 'az' ? 'Şikayət göndərilə bilmədi' : 'Could not submit report'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl shadow-primary/10"
      >
        <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/10 via-transparent to-transparent px-5 py-4">
          <div className="flex items-center gap-3 text-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg">
              {language === "az" ? "Şikayət et" : "Report user"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={language === "az" ? "Bağla" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'az' 
              ? `${reportedName} adlı istifadəçi niyə şikayət edilir? Bu məlumat gizli saxlanılacaq.`
              : `Why are you reporting ${reportedName}? This information will be kept strictly confidential.`}
          </p>

          <div className="space-y-2 mb-5">
            {REPORT_REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReason(r.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                  reason === r.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground hover:border-primary/40"
                }`}
              >
                {r.label[language as "az" | "en"]}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {reason === 'other' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-5"
              >
                <textarea
                  className="h-24 w-full resize-none rounded-2xl border border-border bg-muted p-3 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
                  placeholder={language === 'az' ? 'Əlavə məlumat verin...' : 'Provide additional details...'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            className="h-12 w-full rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 font-bold"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {language === "az" ? "Şikayəti göndər" : "Submit report"}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
