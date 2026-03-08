"use client";

import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AboutBackButton() {
  return (
    <Link href="/">
      <Button variant="ghost" size="icon" className="rounded-full">
        <ArrowLeft className="w-5 h-5" />
      </Button>
    </Link>
  );
}

export function AboutCTAButton() {
  return (
    <Link href="/discovery">
      <Button className="gradient-brand text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all">
        <Heart className="w-5 h-5 mr-2" />
        Başla
      </Button>
    </Link>
  );
}
