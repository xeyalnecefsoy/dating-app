"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export function HomeBannerSlider() {
  const { language } = useLanguage();
  const rawSlides = useQuery(api.banners.getActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0);

  const slides = rawSlides || [];

  // Auto-play interval
  useEffect(() => {
    if (isHovered || slides.length <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  if (rawSlides === undefined || slides.length === 0) {
    return null;
  }

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  // Safe accessors for localized text
  const getLoc = (obj: any, field: string) => {
    if (!obj) return "";
    return language === 'az' ? (obj[field + 'Az'] || obj[field + 'En']) : (obj[field + 'En'] || obj[field + 'Az']);
  };

  const title = getLoc(currentSlide, 'title');
  const desc = getLoc(currentSlide, 'description');
  const cta = getLoc(currentSlide, 'ctaText');
  const hasTextParams = !!(title || desc || cta);

  return (
    <div 
      className="relative w-full aspect-[2/1] sm:aspect-[3/1] max-h-48 rounded-2xl overflow-hidden group mb-6 bg-muted/50 border border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className={`absolute inset-0 w-full h-full flex flex-col justify-center
            ${!currentSlide.imageUrl ? (currentSlide.gradient ? `bg-gradient-to-r ${currentSlide.gradient}` : 'bg-gradient-to-r from-primary to-accent') : 'bg-black'}
          `}
        >
          {/* Background Image / Image Only */}
          {currentSlide.imageUrl && (
            <div 
              className={`absolute inset-0 w-full h-full bg-cover bg-center ${hasTextParams ? 'opacity-50 mix-blend-overlay' : 'opacity-100'}`}
              style={{ backgroundImage: `url(${currentSlide.imageUrl})` }}
            />
          )}

          {/* Text Content Overlay (Only rendered if text fields exist) */}
          {hasTextParams && (
            <div className="relative z-10 max-w-[80%] p-6 text-white text-shadow-sm">
              {title && (
                <h2 className="text-xl sm:text-2xl font-bold mb-2 line-clamp-1 drop-shadow-md">
                  {title}
                </h2>
              )}
              {desc && (
                <p className="text-sm sm:text-base opacity-90 mb-4 line-clamp-2 drop-shadow">
                  {desc}
                </p>
              )}
              
              {cta && currentSlide.ctaLink && (
                <Link href={currentSlide.ctaLink}>
                  <Button size="sm" variant="secondary" className="rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow text-black flex items-center gap-1.5 h-8">
                    {cta}
                    {currentSlide.ctaLink.startsWith('http') ? <ExternalLink className="w-3.5 h-3.5" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* If there's a link but no CTA text (e.g. image-only banner that is clickable) */}
          {!hasTextParams && currentSlide.ctaLink && (
            <Link href={currentSlide.ctaLink} className="absolute inset-0 z-10" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <div className="absolute inset-0 z-20 flex items-center justify-between p-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handlePrev} 
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center text-white pointer-events-auto transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNext} 
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center text-white pointer-events-auto transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5 pointer-events-none">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`pointer-events-auto w-1.5 h-1.5 rounded-full transition-all duration-300 drop-shadow-md ${
                i === currentIndex ? "w-4 bg-white" : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
