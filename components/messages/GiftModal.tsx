"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VIRTUAL_GIFTS, GIFT_CATEGORIES, VirtualGift } from "@/lib/virtual-gifts";

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendGift: (gift: VirtualGift) => void;
  recipientName: string;
  language: "en" | "az";
}

export function GiftModal({ isOpen, onClose, onSendGift, recipientName, language }: GiftModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGift, setSelectedGift] = useState<VirtualGift | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredGifts = selectedCategory === "all" 
    ? VIRTUAL_GIFTS 
    : VIRTUAL_GIFTS.filter(g => g.category === selectedCategory);

  const handleSend = () => {
    if (selectedGift) {
      onSendGift(selectedGift);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedGift(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-card rounded-t-3xl w-full max-w-lg max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">
                  {language === 'az' ? 'Hədiyyə Göndər' : 'Send a Gift'}
                </h3>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {showSuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-10 text-center"
              >
                <div className="text-6xl mb-4">{selectedGift?.emoji}</div>
                <h3 className="text-xl font-bold mb-2">
                  {language === 'az' ? 'Hədiyyə göndərildi!' : 'Gift sent!'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'az' 
                    ? `${recipientName} hədiyyənizi alacaq` 
                    : `${recipientName} will receive your gift`}
                </p>
              </motion.div>
            ) : (
              <>
                {/* Categories */}
                <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
                  {GIFT_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {language === 'az' ? cat.nameAz : cat.name}
                    </button>
                  ))}
                </div>

                {/* Gifts Grid */}
                <div className="grid grid-cols-4 gap-3 p-4 overflow-y-auto max-h-[40vh]">
                  {filteredGifts.map(gift => (
                    <button
                      key={gift.id}
                      onClick={() => setSelectedGift(gift)}
                      className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
                        selectedGift?.id === gift.id 
                          ? 'bg-primary/20 border-2 border-primary scale-105' 
                          : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                      }`}
                    >
                      <span className="text-3xl mb-1">{gift.emoji}</span>
                      <span className="text-xs font-medium truncate w-full text-center">
                        {language === 'az' ? gift.nameAz : gift.name}
                      </span>
                      <span className="text-[10px] text-primary font-bold">
                        {gift.price} ₼
                      </span>
                    </button>
                  ))}
                </div>

                {/* Send Button */}
                <div className="p-4 border-t border-border">
                  <Button 
                    onClick={handleSend}
                    disabled={!selectedGift}
                    className="w-full h-12 rounded-xl font-semibold gradient-brand border-0"
                  >
                    {selectedGift ? (
                      <>
                        {language === 'az' 
                          ? `${selectedGift.emoji} Göndər (${selectedGift.price} ₼)` 
                          : `Send ${selectedGift.emoji} (${selectedGift.price} ₼)`}
                      </>
                    ) : (
                      language === 'az' ? 'Hədiyyə seçin' : 'Select a gift'
                    )}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
