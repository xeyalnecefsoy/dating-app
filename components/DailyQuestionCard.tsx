"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTodaysQuestion } from "@/lib/daily-questions";

export function DailyQuestionCard() {
  const { language, t } = useLanguage();
  const todaysQuestion = getTodaysQuestion();

  const categoryColors: Record<string, string> = {
    values: "from-rose-500 to-pink-600",
    relationships: "from-indigo-500 to-purple-600",
    growth: "from-emerald-500 to-teal-600",
    fun: "from-amber-500 to-orange-600"
  };

  const categoryEmoji: Record<string, string> = {
    values: "💎",
    relationships: "💝",
    growth: "🌱",
    fun: "🎉"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`bg-gradient-to-r ${categoryColors[todaysQuestion.category]} text-white shadow-xl overflow-hidden`}>
        <CardContent className="p-6 relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <h3 className="font-semibold">{t("daily.title")}</h3>
              </div>
              <span className="text-2xl">{categoryEmoji[todaysQuestion.category]}</span>
            </div>
            
            <p className="text-lg md:text-xl font-medium leading-relaxed">
              "{language === 'az' ? todaysQuestion.question.az : todaysQuestion.question.en}"
            </p>
            
            <p className="text-white/70 text-sm mt-4 italic">{t("daily.reflect")}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
