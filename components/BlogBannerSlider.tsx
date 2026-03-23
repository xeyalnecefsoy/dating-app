"use client";

import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

export type BannerSlide = {
  tag: string;
  title: string;
  description: string;
  href: string;
  image: string;
};

export function BlogBannerSlider({ slides }: { slides: BannerSlide[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || slides.length === 0) return;
    
    // Find which slide is closest to the left edge
    const containerRect = el.getBoundingClientRect();
    const children = Array.from(el.children) as HTMLElement[];
    let closestIndex = 0;
    let minDistance = Infinity;

    // The gap makes simple math less reliable, so we measure actual element positions
    // We ignore the first non-Slide child which is the empty Link. Wait, all children inside 'ref={scrollRef}' are slides?
    // Let's filter children that have 'href' or 'tagName' A.
    const slideChildren = children.filter(c => c.tagName === 'A');

    slideChildren.forEach((child, index) => {
      const rect = child.getBoundingClientRect();
      const distance = Math.abs(rect.left - containerRect.left);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
    const maxDotIndex = isDesktop && slides.length > 2 ? slides.length - 2 : slides.length - 1;
    setActiveIndex(Math.min(closestIndex, Math.max(0, maxDotIndex)));
  }, [slides.length]);

  const scrollTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const slideChildren = Array.from(el.children).filter(c => c.tagName === 'A') as HTMLElement[];
    
    if (slideChildren[index]) {
      const targetChild = slideChildren[index];
      // We want to align the child's left edge with the container's left edge
      // offsetLeft is relative to the offsetParent, which might not be `el` if `el` is not positioned
      // A safer robust way is to just use scrollLeft + targetChild.getBoundingClientRect().left - el.getBoundingClientRect().left
      const targetScrollLeft = el.scrollLeft + targetChild.getBoundingClientRect().left - el.getBoundingClientRect().left;
      
      el.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
    }
  };

  return (
    <section className="mb-10 md:mb-14">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Seçilmiş məqalələr
        </h2>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Sürüşdürün
        </span>
      </div>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 px-4 md:px-0 scroll-smooth hide-scrollbar scroll-px-4 md:scroll-px-0"
          role="region"
          aria-label="Seçilmiş məqalələr slider"
        >
          {slides.map((slide) => (
            <Link
              key={slide.href}
              href={slide.href}
              className="snap-start shrink-0 w-[86%] sm:w-[72%] md:w-[56%] lg:w-[48%]"
            >
              <article className="relative h-52 md:h-64 rounded-3xl overflow-hidden border border-border/60 bg-card group">
                <div className="absolute inset-0">
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    className="object-cover opacity-90 group-hover:opacity-95 transition-opacity"
                    sizes="(min-width: 1024px) 480px, (min-width: 768px) 56vw, 86vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-background/92 via-background/55 to-transparent" />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-between p-5 md:p-6">
                  <div className="space-y-2">
                    <span className="inline-flex items-center rounded-full bg-primary/20 text-primary text-[11px] font-semibold px-3 py-1 uppercase tracking-wide">
                      {slide.tag}
                    </span>
                    <h3 className="text-base md:text-xl font-semibold leading-snug line-clamp-2">
                      {slide.title}
                    </h3>
                    <p className="text-xs md:text-sm text-foreground/80 line-clamp-2 max-w-md">
                      {slide.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-primary">
                    Məqaləyə keç
                    <span aria-hidden>↗</span>
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-linear-to-l from-background to-transparent" />
      </div>
      <div className="flex items-center justify-center gap-2 mt-4">
        {slides.map((_, i) => {
          const isRedundantOnDesktop = i === slides.length - 1 && slides.length > 2;
          return (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                scrollTo(i);
              }}
              className={`w-2 h-2 rounded-full transition-all flex border-0 p-0 ${
                i === activeIndex
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
              } ${isRedundantOnDesktop ? 'md:hidden' : ''}`}
              aria-label={`Slayd ${i + 1}`}
            />
          );
        })}
      </div>
    </section>
  );
}
