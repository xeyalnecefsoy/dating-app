"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Camera, CheckCircle2, Shield, 
  User, AlertCircle, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type VerificationStep = "intro" | "camera" | "processing" | "success";

export default function VerifyPage() {
  const { language } = useLanguage();
  const [step, setStep] = useState<VerificationStep>("intro");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setStep("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        
        // Stop camera
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        
        // Simulate processing
        setStep("processing");
        setTimeout(() => {
          setStep("success");
        }, 2500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 h-14 flex items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-bold text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          {language === 'az' ? 'Profil Yoxlaması' : 'Profile Verification'}
        </h1>
        <div className="w-10" />
      </header>

      <main className="p-4 pb-24 max-w-lg mx-auto">
        {/* Intro Step */}
        {step === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Shield className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3">
              {language === 'az' ? 'Profilinizi təsdiqləyin' : 'Verify your profile'}
            </h2>
            
            <p className="text-muted-foreground mb-8">
              {language === 'az' 
                ? 'Təsdiqlənmiş profillər 3x daha çox uyğunluq qazanır' 
                : 'Verified profiles get 3x more matches'}
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8 text-left">
              <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">
                    {language === 'az' ? 'Təsdiq nişanı' : 'Verified badge'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'az' 
                      ? 'Profilinizda mavi təsdiq nişanı görünəcək' 
                      : 'Blue badge will appear on your profile'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">
                    {language === 'az' ? 'Daha çox etibar' : 'More trust'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'az' 
                      ? 'İstifadəçilər təsdiqlənmiş profillərə daha çox güvənir' 
                      : 'Users trust verified profiles more'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">
                    {language === 'az' ? 'Saxta olmadığınızı sübut edin' : 'Prove you\'re real'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'az' 
                      ? 'Canlı selfie ilə şəxsiyyətinizi təsdiqləyin' 
                      : 'Verify your identity with a live selfie'}
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={startCamera}
              className="w-full h-14 rounded-2xl text-lg font-bold gradient-brand border-0"
            >
              <Camera className="w-5 h-5 mr-2" />
              {language === 'az' ? 'Kameraya keçin' : 'Start Verification'}
            </Button>
          </motion.div>
        )}

        {/* Camera Step */}
        {step === "camera" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="relative mb-6">
              {/* Pose Guide Overlay */}
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-4 border-dashed border-white/50 rounded-full" />
              </div>
              
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-square object-cover rounded-3xl bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <p className="text-muted-foreground mb-4">
              {language === 'az' 
                ? 'Üzünüzü dairənin içinə yerləşdirin' 
                : 'Position your face inside the circle'}
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
              <AlertCircle className="w-4 h-4" />
              {language === 'az' 
                ? 'Yaxşı işıqlandırmada çəkin' 
                : 'Take photo in good lighting'}
            </div>

            <Button 
              onClick={capturePhoto}
              className="w-full h-14 rounded-2xl text-lg font-bold gradient-brand border-0"
            >
              <Camera className="w-5 h-5 mr-2" />
              {language === 'az' ? 'Şəkil çəkin' : 'Take Photo'}
            </Button>
          </motion.div>
        )}

        {/* Processing Step */}
        {step === "processing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            {capturedImage && (
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-primary"
              />
            )}
            
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            
            <h2 className="text-xl font-bold mb-2">
              {language === 'az' ? 'Yoxlanılır...' : 'Verifying...'}
            </h2>
            
            <p className="text-muted-foreground">
              {language === 'az' 
                ? 'Şəkliniz analiz edilir' 
                : 'Analyzing your photo'}
            </p>
          </motion.div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold mb-3">
              {language === 'az' ? 'Təsdiqləndiniz!' : 'You\'re Verified!'}
            </h2>
            
            <p className="text-muted-foreground mb-8">
              {language === 'az' 
                ? 'Profilinizda təsdiq nişanı görünəcək' 
                : 'Verification badge will appear on your profile'}
            </p>
            
            {capturedImage && (
              <div className="relative w-32 h-32 mx-auto mb-8">
                <img 
                  src={capturedImage} 
                  alt="Verified" 
                  className="w-full h-full rounded-full object-cover border-4 border-green-500"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-background">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
            
            <Link href="/profile">
              <Button className="w-full h-14 rounded-2xl text-lg font-bold gradient-brand border-0">
                {language === 'az' ? 'Profilə keçin' : 'Go to Profile'}
              </Button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
