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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-lg">
              {language === 'az' ? 'Şikayət Et' : 'Report'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
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
                onClick={() => setReason(r.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  reason === r.id 
                    ? "border-red-500 bg-red-500/10 text-red-500" 
                    : "border-border hover:border-muted-foreground/30 text-foreground"
                }`}
              >
                {r.label[language as 'az' | 'en']}
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
                  className="w-full h-24 p-3 bg-muted border border-border rounded-xl text-sm placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-red-500/50"
                  placeholder={language === 'az' ? 'Əlavə məlumat verin...' : 'Provide additional details...'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            onClick={handleSubmit} 
            disabled={!reason || isSubmitting}
            className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white h-12 text-md shadow-lg shadow-red-500/20 transition-all font-bold"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
               <>
                 <Send className="w-4 h-4 mr-2" />
                 {language === 'az' ? 'Şikayəti Göndər' : 'Submit Report'}
               </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
