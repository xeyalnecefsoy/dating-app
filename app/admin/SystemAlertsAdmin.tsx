import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, AlertTriangle, Info, Plus, Trash2, Power } from "lucide-react";

export function SystemAlertsAdmin() {
  const { showToast } = useToast();
  const alerts = useQuery(api.systemAlerts.listAlerts) || [];
  const createAlertMut = useMutation(api.systemAlerts.createAlert);
  const toggleAlertMut = useMutation(api.systemAlerts.toggleAlertStatus);
  const deleteAlertMut = useMutation(api.systemAlerts.deleteAlert);

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    type: "info", // "info" or "maintenance"
    titleAz: "",
    titleEn: "",
    messageAz: "",
    messageEn: "",
    blocksAccess: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!formData.titleAz || !formData.messageAz) {
       showToast({ title: "Azərbaycan dilində başlıq və məzmun daxil edilməlidir.", type: "error" });
       return;
    }

    setIsSubmitting(true);
    try {
      await createAlertMut({
        ...formData,
      });
      showToast({ title: "Bildiriş uğurla yaradıldı və aktiv edildi.", type: "success" });
      setIsCreating(false);
      setFormData({
        type: "info",
        titleAz: "",
        titleEn: "",
        messageAz: "",
        messageEn: "",
        blocksAccess: false,
      });
    } catch (e) {
      console.error(e);
      showToast({ title: "Xəta baş verdi.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: any, currentStatus: boolean) => {
    try {
      await toggleAlertMut({ id, isActive: !currentStatus });
      showToast({ title: `Bildiriş ${!currentStatus ? 'aktiv' : 'deaktiv'} edildi.`, type: "success" });
    } catch (e) {
      console.error(e);
      showToast({ title: "Xəta baş verdi.", type: "error" });
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Bu bildirişi silmək istədiyinizə əminsiniz?")) return;
    try {
      await deleteAlertMut({ id });
      showToast({ title: "Bildiriş silindi.", type: "success" });
    } catch (e) {
      console.error(e);
      showToast({ title: "Xəta baş verdi.", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sistem Bildirişləri</h2>
          <p className="text-muted-foreground text-sm">Real-time bildirişlər və texniki fasilə idarəetməsi.</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Yeni Bildiriş
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Yeni Bildiriş Yarat</CardTitle>
            <CardDescription>
              Aktiv edildikdə digər bütün aktiv bildirişlər avtomatik deaktiv ediləcək.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Növü</label>
                <select 
                   value={formData.type}
                   onChange={(e) => setFormData({...formData, type: e.target.value})}
                   className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                   <option value="info">Məlumat (Info)</option>
                   <option value="maintenance">Texniki Fasilə (Maintenance)</option>
                </select>
              </div>
              <div className="space-y-2 flex flex-col justify-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch 
                     checked={formData.blocksAccess}
                     onCheckedChange={(c) => setFormData({...formData, blocksAccess: c})}
                  />
                  <span className="text-sm font-medium text-destructive">Tətbiqə Girişi Blokla (Yalnız Adminlər girə bilər)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Başlıq (AZ) *</label>
                <Input 
                   value={formData.titleAz}
                   onChange={(e) => setFormData({...formData, titleAz: e.target.value})}
                   placeholder="Məs: Qısamüddətli Texniki Fasilə"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Başlıq (EN)</label>
                <Input 
                   value={formData.titleEn}
                   onChange={(e) => setFormData({...formData, titleEn: e.target.value})}
                   placeholder="Məs: Short Maintenance Break"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mətn (AZ) *</label>
                <Textarea 
                   value={formData.messageAz}
                   onChange={(e) => setFormData({...formData, messageAz: e.target.value})}
                   placeholder="Tətbiqdə yeniliklər edilir, tezliklə qayıdacağıq..."
                   rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mətn (EN)</label>
                <Textarea 
                   value={formData.messageEn}
                   onChange={(e) => setFormData({...formData, messageEn: e.target.value})}
                   placeholder="We are upgrading the app, back soon..."
                   rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreating(false)} disabled={isSubmitting}>İmtina</Button>
              <Button onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting ? "Yaradılır..." : "Yarat və Aktiv Et"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {alerts.length === 0 ? (
           <div className="text-center py-10 text-muted-foreground border rounded-xl border-dashed">
             Hələ heç bir bildiriş yaradılmayıb.
           </div>
        ) : alerts.map((alert: any) => (
          <Card key={alert._id} className={`overflow-hidden transition-all ${alert.isActive ? 'border-border shadow-sm' : 'opacity-70 grayscale-[50%]'}`}>
             <div className="flex flex-col md:flex-row">
               <div className={`w-2 shrink-0 ${alert.isActive ? (alert.type === 'maintenance' ? 'bg-destructive' : 'bg-blue-500') : 'bg-muted'}`} />
               <div className="flex-1 p-5">
                 <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                     {alert.type === 'maintenance' ? <AlertTriangle className={`w-5 h-5 ${alert.isActive ? 'text-destructive' : 'text-muted-foreground'}`} /> : <Info className={`w-5 h-5 ${alert.isActive ? 'text-blue-500' : 'text-muted-foreground'}`} />}
                     <h3 className="font-bold text-lg">{alert.titleAz}</h3>
                     {alert.blocksAccess && (
                         <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20 uppercase tracking-wider">
                           Girişi Bloklayır
                         </span>
                     )}
                   </div>
                   <div className="flex items-center gap-3">
                     <span className={`text-sm font-medium ${alert.isActive ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {alert.isActive ? 'Aktivdir' : 'Deaktivdir'}
                     </span>
                     <Switch 
                       checked={alert.isActive}
                       onCheckedChange={() => handleToggle(alert._id, alert.isActive)}
                     />
                   </div>
                 </div>
                 <p className="text-muted-foreground text-sm mb-4">{alert.messageAz}</p>
                 <div className="flex justify-between items-center pt-3 border-t border-border">
                   <div className="text-xs text-muted-foreground">
                     {new Date(alert.createdAt).toLocaleString('az-AZ')}
                   </div>
                   <Button variant="ghost" size="sm" onClick={() => handleDelete(alert._id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2">
                     <Trash2 className="w-4 h-4 mr-2" /> Sil
                   </Button>
                 </div>
               </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
