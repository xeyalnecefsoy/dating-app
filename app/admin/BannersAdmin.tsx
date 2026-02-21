"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, GripVertical, CheckCircle2, XCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function BannersAdmin() {
  const { showToast } = useToast();
  const rawBanners = useQuery(api.banners.getAll);
  const banners = rawBanners || [];
  
  const createBanner = useMutation(api.banners.create);
  const updateBanner = useMutation(api.banners.update);
  const toggleActive = useMutation(api.banners.toggleActive);
  const removeBanner = useMutation(api.banners.remove);
  const generateUploadUrl = useMutation(api.banners.generateUploadUrl);

  const [isEditing, setIsEditing] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [formData, setFormData] = useState({
    titleAz: "", titleEn: "",
    descriptionAz: "", descriptionEn: "",
    ctaTextAz: "", ctaTextEn: "",
    ctaLink: "", gradient: "from-primary to-accent",
    isActive: true, order: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Gradient presets
  const gradients = [
    "from-primary to-accent",
    "from-pink-500 to-rose-500",
    "from-blue-500 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-purple-500 to-indigo-500",
    "from-zinc-800 to-black"
  ];

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      titleAz: banner.titleAz || "", titleEn: banner.titleEn || "",
      descriptionAz: banner.descriptionAz || "", descriptionEn: banner.descriptionEn || "",
      ctaTextAz: banner.ctaTextAz || "", ctaTextEn: banner.ctaTextEn || "",
      ctaLink: banner.ctaLink || "", 
      gradient: banner.gradient || "from-primary to-accent",
      isActive: banner.isActive,
      order: banner.order || 0
    });
    setImageFile(null);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setEditingBanner(null);
    setFormData({
      titleAz: "", titleEn: "",
      descriptionAz: "", descriptionEn: "",
      ctaTextAz: "", ctaTextEn: "",
      ctaLink: "", gradient: "from-primary to-accent",
      isActive: true, order: banners.length
    });
    setImageFile(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let storageId: any = undefined;

      // Upload image if selected
      if (imageFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        const { storageId: returnedStorageId } = await result.json();
        storageId = returnedStorageId;
      }

      const payload = { ...formData, storageId };

      if (editingBanner) {
        await updateBanner({ id: editingBanner._id, ...payload });
        showToast({ title: "Banner yeniləndi", type: "success" });
      } else {
        await createBanner(payload as any);
        showToast({ title: "Banner yaradıldı", type: "success" });
      }

      setIsEditing(false);
    } catch (e) {
      console.error(e);
      showToast({ title: "Xəta baş verdi", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Bu banneri silməyə əminsiniz?")) return;
    try {
      await removeBanner({ id });
      showToast({ title: "Banner silindi", type: "success" });
    } catch (e) {
      showToast({ title: "Xəta", type: "error" });
    }
  };

  if (rawBanners === undefined) {
    return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <motion.div
      key="banners"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Banner İdarəetməsi</h2>
          <p className="text-sm text-muted-foreground">Ana səhifədə görünəcək slaydları idarə edin.</p>
        </div>
        {!isEditing && (
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="w-4 h-4" /> Yeni Banner
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-card border border-border rounded-2xl flex flex-col max-h-[calc(100vh-10rem)] shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b shrink-0 bg-muted/10">
            <h3 className="font-semibold text-lg">{editingBanner ? "Banneri Redaktə Et" : "Yeni Banner"}</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Bağla</Button>
          </div>

          <div className="p-4 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image Upload Area */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label className="text-xs">Arxa fon şəkli (İstəyə bağlı)</Label>
                <div className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center min-h-24 relative overflow-hidden transition-colors ${imageFile || editingBanner?.imageUrl ? 'border-primary/50' : 'border-border hover:border-primary/30'}`}>
                  {(imageFile || editingBanner?.imageUrl) && (
                     <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" 
                          style={{ backgroundImage: `url(${imageFile ? URL.createObjectURL(imageFile) : editingBanner.imageUrl})` }} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="text-center relative z-20 pointer-events-none">
                    <ImageIcon className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground font-medium">Şəkil yükləmək üçün kliklə</p>
                    <p className="text-[10px] text-muted-foreground opacity-70">2:1 və ya 3:1 nisbətində üfüqi şəkil.</p>
                    {imageFile && <p className="text-xs text-primary mt-1 truncate max-w-[200px]">{imageFile.name}</p>}
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="space-y-3 bg-muted/10 p-3 rounded-xl border border-border/50">
                <h4 className="font-semibold text-xs uppercase text-muted-foreground tracking-wider mb-2">Azərbaycan dili</h4>
                <div className="space-y-1.5">
                  <Label className="text-xs">Başlıq</Label>
                  <Input className="h-8 text-sm" value={formData.titleAz} onChange={e => setFormData({...formData, titleAz: e.target.value})} placeholder="Məs: Premium əldə edin" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Mətn</Label>
                  <Textarea className="min-h-[60px] text-sm resize-none" value={formData.descriptionAz} onChange={e => setFormData({...formData, descriptionAz: e.target.value})} placeholder="Qısa məlumat..." />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Düymə mətni</Label>
                  <Input className="h-8 text-sm" value={formData.ctaTextAz} onChange={e => setFormData({...formData, ctaTextAz: e.target.value})} placeholder="Məs: İndi Bax" />
                </div>
              </div>

              <div className="space-y-3 bg-muted/10 p-3 rounded-xl border border-border/50">
                <h4 className="font-semibold text-xs uppercase text-muted-foreground tracking-wider mb-2">İngilis dili</h4>
                <div className="space-y-1.5">
                  <Label className="text-xs">Title</Label>
                  <Input className="h-8 text-sm" value={formData.titleEn} onChange={e => setFormData({...formData, titleEn: e.target.value})} placeholder="Ex: Get Premium" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description</Label>
                  <Textarea className="min-h-[60px] text-sm resize-none" value={formData.descriptionEn} onChange={e => setFormData({...formData, descriptionEn: e.target.value})} placeholder="Short description..." />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Button text</Label>
                  <Input className="h-8 text-sm" value={formData.ctaTextEn} onChange={e => setFormData({...formData, ctaTextEn: e.target.value})} placeholder="Ex: See Now" />
                </div>
              </div>
              
               <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Hədəf Link (URL - Tətbiq daxili və ya kənar ola bilər)</Label>
                  <Input className="h-8 text-sm" value={formData.ctaLink} onChange={e => setFormData({...formData, ctaLink: e.target.value})} placeholder="/premium və ya https://..." />
                </div>

               <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs">Gradient fon (Şəkil yoxdursa və ya şəklin arxasında görünəcək)</Label>
                  <div className="flex flex-wrap gap-2">
                    {gradients.map(grad => (
                      <div 
                        key={grad}
                        onClick={() => setFormData({...formData, gradient: grad})}
                        className={`w-8 h-8 rounded-md cursor-pointer bg-gradient-to-r ${grad} border-2 transition-all ${formData.gradient === grad ? 'border-primary shadow-md scale-105' : 'border-transparent opacity-80 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
               </div>
               
               <div className="flex items-center justify-between md:col-span-2 bg-muted/20 p-3 rounded-lg border border-border">
                 <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Slaydlarda göstərilsin (Aktiv)</Label>
                    <p className="text-[10px] text-muted-foreground">Deaktiv edilən slaydlar ana səhifədə görünmür.</p>
                 </div>
                 <Switch checked={formData.isActive} onCheckedChange={(c) => setFormData({...formData, isActive: c})} />
               </div>
            </div>
          </div>

          <div className="p-4 border-t shrink-0 flex justify-end gap-3 bg-muted/10">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Ləğv Et</Button>
            <Button size="sm" className="min-w-[100px]" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingBanner ? "Yadda Saxla" : "Yarat")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {banners.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-2xl">
              <ImageIcon className="w-12 h-12 text-muted-foreground opacity-30 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-muted-foreground">Slayd Yoxdur</h3>
              <p className="text-sm text-muted-foreground">Məlumatlandırıcı banner əlavə etmək üçün "Yeni Banner" düyməsinə klikləyin.</p>
            </div>
          ) : (
             banners.map((banner: any, index: number) => (
                <div key={banner._id} className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
                  
                  <div className={`shrink-0 w-full md:w-32 lg:w-48 h-24 rounded-lg overflow-hidden relative flex items-center justify-center shadow-inner text-white bg-gradient-to-r ${banner.gradient || 'from-primary to-accent'}`}>
                     {banner.imageUrl && (
                        <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay" style={{ backgroundImage: `url(${banner.imageUrl})` }} />
                     )}
                     {!banner.imageUrl && <ImageIcon className="w-6 h-6 opacity-50 relative z-10" />}
                  </div>
                  
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold truncate">{banner.titleAz || banner.titleEn || "(Başlıq Yoxdur)"}</h4>
                      {banner.isActive ? (
                        <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Aktiv</span>
                      ) : (
                        <span className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Passiv</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{banner.descriptionAz || banner.descriptionEn}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Sıra: {banner.order}</span>
                      {banner.ctaLink && <span className="truncate max-w-[150px]">Link: {banner.ctaLink}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button variant="ghost" size="icon" onClick={() => toggleActive({ id: banner._id, isActive: !banner.isActive })} title={banner.isActive ? "Deaktiv et" : "Aktivləşdir"}>
                      {banner.isActive ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                      <Pencil className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(banner._id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
             ))
          )}
        </div>
      )}
    </motion.div>
  );
}
