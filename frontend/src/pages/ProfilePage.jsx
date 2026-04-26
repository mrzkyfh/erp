import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/FormField";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";

export function ProfilePage() {
  const profile = useAuthStore((state) => state.profile);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    nik: profile?.nik || "",
    address: profile?.address || "",
    photo_url: profile?.photo_url || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      nik: profile?.nik || "",
      address: profile?.address || "",
      photo_url: profile?.photo_url || "",
    });
  }, [profile]);

  const uploadPhoto = async (file) => {
    if (!file) return;
    const filePath = `${profile.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("profile-photos").upload(filePath, file, {
      upsert: true,
    });
    if (error) throw error;

    const { data } = supabase.storage.from("profile-photos").getPublicUrl(filePath);
    setForm((prev) => ({ ...prev, photo_url: data.publicUrl }));
    toast.success("Foto berhasil diunggah.");
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.7fr,1.3fr]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Profil Saya</CardTitle>
            <CardDescription>Karyawan dapat memperbarui data diri secara mandiri.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-border bg-white p-4">
            {form.photo_url ? (
              <img src={form.photo_url} alt="Profil" className="h-52 w-full rounded-3xl object-cover" />
            ) : (
              <div className="flex h-52 items-center justify-center rounded-3xl bg-muted text-sm text-muted-foreground">
                Belum ada foto profil
              </div>
            )}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium hover:bg-muted">
            <Upload className="h-4 w-4" />
            Upload Foto
            <input
              className="hidden"
              type="file"
              accept="image/*"
              onChange={(e) => uploadPhoto(e.target.files?.[0])}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Data Diri</CardTitle>
            <CardDescription>Perubahan akan disimpan ke profil Supabase Anda.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Nama lengkap">
              <Input value={form.full_name} onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))} />
            </FormField>
            <FormField label="NIK">
              <Input value={form.nik} onChange={(e) => setForm((prev) => ({ ...prev, nik: e.target.value }))} />
            </FormField>
            <FormField label="Nomor HP">
              <Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </FormField>
            <FormField label="Foto URL">
              <Input value={form.photo_url} onChange={(e) => setForm((prev) => ({ ...prev, photo_url: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Alamat">
            <Textarea value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
          </FormField>
          <Button
            disabled={saving}
            onClick={async () => {
              try {
                if (!form.full_name) {
                  toast.error("Nama lengkap wajib diisi.");
                  return;
                }
                setSaving(true);
                await api.put("/auth/profile", form);
                await refreshProfile();
                toast.success("Profil berhasil diperbarui.");
              } catch (error) {
                toast.error(error.message);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
