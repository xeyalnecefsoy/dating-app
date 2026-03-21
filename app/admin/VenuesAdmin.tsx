import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Plus, Trash2, MapPin, Star, Utensils, Coffee, Clapperboard, Gamepad2,
  Database, Search, Pencil, X,
} from "lucide-react";

const TYPE_OPTIONS = [
  { value: "restaurant", label: "Restoran" },
  { value: "cafe", label: "Kafe" },
  { value: "cinema", label: "Kinoteatr" },
  { value: "entertainment", label: "Əyləncə" },
];

const typeIconMap: Record<string, React.ReactNode> = {
  restaurant: <Utensils className="w-4 h-4" />,
  cafe: <Coffee className="w-4 h-4" />,
  cinema: <Clapperboard className="w-4 h-4" />,
  entertainment: <Gamepad2 className="w-4 h-4" />,
};

const CITIES = ["Bakı", "Gəncə", "Şəki", "Qəbələ", "Sumqayıt", "Lənkəran"];

const emptyForm = {
  name: "", type: "restaurant", typeAz: "Restoran", address: "", location: "Bakı",
  image: "", rating: 4.5, priceRange: 2, discount: "", discountCode: "",
  tags: "", tagsAz: "", description: "", descriptionAz: "",
  specialOffer: "", specialOfferAz: "",
};

export function VenuesAdmin() {
  const { showToast } = useToast();
  const rawVenues = useQuery(api.venues.listAllVenues);
  const venues = rawVenues || [];
  const createVenueMut = useMutation(api.venues.createVenue);
  const updateVenueMut = useMutation(api.venues.updateVenue);
  const toggleStatusMut = useMutation(api.venues.toggleVenueStatus);
  const deleteVenueMut = useMutation(api.venues.deleteVenue);
  const seedVenuesMut = useMutation(api.venues.seedVenues);

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCity, setFilterCity] = useState("all");

  // Auto-seed: if DB is empty or has outdated seed data, reseed once
  const hasAutoSeeded = useRef(false);
  const EXPECTED_SEED_COUNT = 16;
  useEffect(() => {
    if (rawVenues !== undefined && rawVenues.length !== EXPECTED_SEED_COUNT && !hasAutoSeeded.current) {
      // Only auto-reseed if there are 0 or exactly 8 (old seed) venues
      if (rawVenues.length === 0 || rawVenues.length === 8) {
        hasAutoSeeded.current = true;
        seedVenuesMut({})
          .then((r: any) => showToast({ title: `${r.seeded} məkan avtomatik yükləndi!`, type: "success" }))
          .catch(() => {});
      }
    }
  }, [rawVenues]);

  // Derived: unique cities from data
  const citiesInData = [...new Set(venues.map((v: any) => v.location))].sort();

  // Filtered venues
  const filteredVenues = venues.filter((v: any) => {
    if (filterType !== "all" && v.type !== filterType) return false;
    if (filterCity !== "all" && v.location !== filterCity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return v.name.toLowerCase().includes(q) || v.address.toLowerCase().includes(q) || v.location.toLowerCase().includes(q);
    }
    return true;
  });

  const handleTypeChange = (type: string) => {
    const typeAz = TYPE_OPTIONS.find((t) => t.value === type)?.label || type;
    setFormData({ ...formData, type, typeAz });
  };

  const openCreateModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setModalMode("create");
  };

  const openEditModal = (venue: any) => {
    setFormData({
      name: venue.name || "",
      type: venue.type || "restaurant",
      typeAz: venue.typeAz || "",
      address: venue.address || "",
      location: venue.location || "Bakı",
      image: venue.image || "",
      rating: venue.rating || 4.5,
      priceRange: venue.priceRange || 2,
      discount: venue.discount ? String(venue.discount) : "",
      discountCode: venue.discountCode || "",
      tags: (venue.tags || []).join(", "),
      tagsAz: (venue.tagsAz || []).join(", "),
      description: venue.description || "",
      descriptionAz: venue.descriptionAz || "",
      specialOffer: venue.specialOffer || "",
      specialOfferAz: venue.specialOfferAz || "",
    });
    setEditingId(venue._id);
    setModalMode("edit");
  };

  const closeModal = () => {
    if (!isSubmitting) setModalMode(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.descriptionAz) {
      showToast({ title: "Ad, ünvan və təsvir (AZ) doldurulmalıdır.", type: "error" });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        typeAz: formData.typeAz,
        address: formData.address,
        location: formData.location,
        image: formData.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
        rating: Number(formData.rating) || 4.5,
        priceRange: Number(formData.priceRange) || 2,
        discount: formData.discount ? Number(formData.discount) : undefined,
        discountCode: formData.discountCode || undefined,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        tagsAz: formData.tagsAz ? formData.tagsAz.split(",").map((t) => t.trim()).filter(Boolean) : [],
        description: formData.description || formData.descriptionAz,
        descriptionAz: formData.descriptionAz,
        specialOffer: formData.specialOffer || undefined,
        specialOfferAz: formData.specialOfferAz || undefined,
      };

      if (modalMode === "edit" && editingId) {
        await updateVenueMut({ id: editingId, ...payload });
        showToast({ title: "Məkan uğurla yeniləndi!", type: "success" });
      } else {
        await createVenueMut(payload);
        showToast({ title: "Məkan uğurla əlavə edildi!", type: "success" });
      }
      setModalMode(null);
      setFormData(emptyForm);
    } catch (e: any) {
      showToast({ title: e?.message || "Xəta baş verdi.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: any, currentStatus: boolean) => {
    try {
      await toggleStatusMut({ id, isActive: !currentStatus });
      showToast({ title: `Məkan ${!currentStatus ? "aktiv" : "deaktiv"} edildi.`, type: "success" });
    } catch { showToast({ title: "Xəta baş verdi.", type: "error" }); }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Bu məkanı silmək istədiyinizə əminsiniz?")) return;
    try {
      await deleteVenueMut({ id });
      showToast({ title: "Məkan silindi.", type: "success" });
    } catch { showToast({ title: "Xəta baş verdi.", type: "error" }); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Məkanlar İdarəetməsi</h2>
          <p className="text-muted-foreground text-sm">
            {filteredVenues.length} məkan {filteredVenues.length !== venues.length ? `(${venues.length} cəmi)` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => seedVenuesMut({}).then((r: any) => showToast({ title: `${r.seeded} məkan yükləndi!`, type: "success" })).catch((e: any) => showToast({ title: e?.message || "Xəta", type: "error" }))} className="gap-2">
            <Database className="w-4 h-4" /> Sıfırla & Yüklə
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" /> Yeni Məkan
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ad, ünvan və ya şəhər axtar..."
            className="pl-9"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">Bütün kateqoriyalar</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">Bütün şəhərlər</option>
          {citiesInData.map((city: string) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Venue Modal (Create / Edit) */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeModal}>
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div>
                <h3 className="text-lg font-bold">{modalMode === "edit" ? "Məkanı Redaktə Et" : "Yeni Məkan Əlavə Et"}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Bütün * sahələr tələb olunur.</p>
              </div>
              <button onClick={closeModal} disabled={isSubmitting} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-destructive/20 transition-colors">✕</button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Name + Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium">Ad *</label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Məs: Scalini" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Kateqoriya</label>
                  <select value={formData.type} onChange={(e) => handleTypeChange(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                    {TYPE_OPTIONS.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                  </select>
                </div>
              </div>
              {/* Address + City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Ünvan *</label>
                  <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Böyük Qala küçəsi 7" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Şəhər</label>
                  <select value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                    {CITIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>
              {/* Image + Rating + Price */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Şəkil URL</label>
                  <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Reytinq (1-5)</label>
                  <Input type="number" min="1" max="5" step="0.1" value={String(formData.rating)} onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Qiymət</label>
                  <select value={formData.priceRange} onChange={(e) => setFormData({ ...formData, priceRange: Number(e.target.value) })} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                    <option value={1}>₼ (ucuz)</option>
                    <option value={2}>₼₼ (orta)</option>
                    <option value={3}>₼₼₼ (bahalı)</option>
                  </select>
                </div>
              </div>
              {/* Discount + Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Endirim (%)</label>
                  <Input type="number" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="15" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Endirim Kodu</label>
                  <Input value={formData.discountCode} onChange={(e) => setFormData({ ...formData, discountCode: e.target.value })} placeholder="LOVE15" />
                </div>
              </div>
              {/* Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Etiketlər (EN)</label>
                  <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="Romantic, Fine Dining" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Etiketlər (AZ)</label>
                  <Input value={formData.tagsAz} onChange={(e) => setFormData({ ...formData, tagsAz: e.target.value })} placeholder="Romantik, Lüks" />
                </div>
              </div>
              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Təsvir (EN)</label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Elegant fine dining..." rows={2} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Təsvir (AZ) *</label>
                  <Textarea value={formData.descriptionAz} onChange={(e) => setFormData({ ...formData, descriptionAz: e.target.value })} placeholder="Zərif restoran..." rows={2} />
                </div>
              </div>
              {/* Special Offers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Xüsusi Təklif (EN)</label>
                  <Input value={formData.specialOffer} onChange={(e) => setFormData({ ...formData, specialOffer: e.target.value })} placeholder="Free dessert for couples" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Xüsusi Təklif (AZ)</label>
                  <Input value={formData.specialOfferAz} onChange={(e) => setFormData({ ...formData, specialOfferAz: e.target.value })} placeholder="Cütlüklər üçün pulsuz desert" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
              <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>İmtina</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Gözləyin..." : modalMode === "edit" ? "Yadda Saxla" : "Əlavə Et"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredVenues.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground border rounded-xl border-dashed">
            {venues.length === 0 ? "Məkanlar yüklənir..." : "Axtarış nəticəsi tapılmadı."}
          </div>
        ) : (
          filteredVenues.map((venue: any) => (
            <Card
              key={venue._id}
              className={`overflow-hidden transition-all cursor-pointer hover:border-primary/40 ${venue.isActive ? "border-border" : "opacity-60 grayscale-[50%]"}`}
              onClick={() => openEditModal(venue)}
            >
              <div className="flex gap-3 p-3">
                {/* Thumbnail */}
                <div className="w-20 h-20 shrink-0 relative rounded-lg overflow-hidden">
                  <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                  {venue.discount && (
                    <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full">
                      -{venue.discount}%
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate">{venue.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-0.5">{typeIconMap[venue.type]} {venue.typeAz}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-500" /> {venue.rating}</span>
                        <span>{"₼".repeat(venue.priceRange)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEditModal(venue)} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <Switch checked={venue.isActive} onCheckedChange={() => handleToggle(venue._id, venue.isActive)} className="scale-75" />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" /> {venue.address}, {venue.location}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      {venue.discountCode && (
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold">{venue.discountCode}</span>
                      )}
                      {venue.tagsAz?.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">{tag}</span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(venue._id); }}
                      className="text-destructive/60 hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
