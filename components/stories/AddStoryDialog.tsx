"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type AddStoryDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddStoryDialog({ isOpen, onClose }: AddStoryDialogProps) {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isExpandedPreview, setIsExpandedPreview] = useState(false);

  const generateUploadUrl = useMutation(api.stories.generateUploadUrl);
  const createStory = useMutation(api.stories.create);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showToast({
          type: "error",
          title: language === "az" ? "Xəta" : "Error",
          message: language === "az" ? "Fayl çox böyükdür (maks 10MB)" : "File too large (max 10MB)",
        });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsExpandedPreview(true); // Auto-expand when chosen
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // 1. Get upload URL from Convex
      const postUrl = await generateUploadUrl();

      // 2. Upload file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!result.ok) throw new Error("Upload failed");

      const { storageId } = await result.json();

      // 3. Save story reference in db
      await createStory({
        storageId,
        mediaType: selectedFile.type.startsWith("video/") ? "video" : "image",
        caption: caption.trim() || undefined,
        isPublic,
      });

      showToast({
        type: "success",
        title: language === "az" ? "Uğurlu!" : "Success!",
        message: language === "az" ? "Hekayə paylaşıldı" : "Story shared",
      });

      handleClose();
    } catch (error) {
      console.error("Story upload error:", error);
      showToast({
        type: "error",
        title: language === "az" ? "Xəta" : "Error",
        message: language === "az" ? "Hekayə paylaşıla bilmədi" : "Failed to share story",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCaption("");
    setIsPublic(true);
    setIsExpandedPreview(false);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  {language === "az" ? "Yeni Hekayə" : "New Story"}
                </h2>
                <button 
                  onClick={handleClose}
                  className="p-2 bg-muted/50 hover:bg-muted text-muted-foreground rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Media Preview / Selection */}
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className={`relative w-40 sm:w-48 aspect-[9/16] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${
                      previewUrl 
                        ? "border-primary/50 bg-black shadow-md cursor-zoom-in" 
                        : "border-border hover:border-primary/50 bg-muted/30 cursor-pointer"
                    }`}
                    onClick={() => {
                      if (previewUrl) {
                        setIsExpandedPreview(true);
                      } else {
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    {previewUrl ? (
                      <>
                        {selectedFile?.type.startsWith("video/") ? (
                          <video src={previewUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                        ) : (
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        )}
                        
                        {/* Delete Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            URL.revokeObjectURL(previewUrl);
                            setPreviewUrl(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                          <ImageIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {language === "az" ? "Şəkil seçin" : "Select photo"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            9:16 format<br/>
                            (Maks 10MB)
                          </p>
                        </div>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*,video/mp4,video/quicktime"
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>

                {/* Caption */}
                <div className="space-y-2">
                  <Label htmlFor="caption" className="text-sm text-muted-foreground">
                    {language === "az" ? "Mətn (məcburi deyil)" : "Caption (optional)"}
                  </Label>
                  <Input 
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder={language === "az" ? "Nəsə yaz..." : "Write something..."}
                    className="bg-muted/50"
                    maxLength={100}
                  />
                </div>

                {/* Privacy Settings */}
                <div className="bg-muted/30 p-4 rounded-2xl border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        {isPublic ? <Globe className="w-4 h-4 text-primary" /> : <Lock className="w-4 h-4 text-orange-500" />}
                        {language === "az" ? "Hər kəsə açıq" : "Public story"}
                      </Label>
                      <p className="text-xs text-muted-foreground max-w-[250px]">
                        {isPublic 
                          ? (language === "az" ? "Hekayənizi hər kəs görə bilər" : "Anyone can view your story")
                          : (language === "az" ? "Yalnız uyğunlaşdığınız şəxslər görə bilər" : "Only your matches can view this")
                        }
                      </p>
                    </div>
                    <Switch 
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border bg-background">
                <Button 
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="w-full h-12 rounded-full font-medium shadow-lg hover:shadow-primary/20"
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{language === "az" ? "Paylaşılır..." : "Sharing..."}</span>
                    </div>
                  ) : (
                    language === "az" ? "Paylaş" : "Share Story"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Preview Modal */}
      <AnimatePresence>
        {isExpandedPreview && previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsExpandedPreview(false)}
          >
            <div className="relative w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl">
              {selectedFile?.type.startsWith("video/") ? (
                <video src={previewUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
              ) : (
                <img src={previewUrl} alt="Expanded Preview" className="w-full h-full object-cover" />
              )}
            </div>
            {/* Close Button */}
            <button 
              onClick={() => setIsExpandedPreview(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
