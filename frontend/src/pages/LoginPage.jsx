import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
});

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await login(values);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 p-10 text-white shadow-xl lg:block">
          <div className="inline-flex rounded-lg bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            Solusi operasional untuk bisnis Indonesia
          </div>
          <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight">
            Kelola absensi, gaji, stok, dan pelanggan dalam satu sistem.
          </h1>
          <p className="mt-5 max-w-lg text-base text-slate-300">
            Dibangun untuk owner, manager, dan karyawan dengan akses yang jelas, workflow mobile-first,
            dan integrasi Supabase untuk autentikasi, storage, serta realtime absensi.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              "QR code absensi + GPS",
              "RLS berbasis role",
              "Slip gaji otomatis",
              "Notifikasi stok minimum",
            ].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <Card className="mx-auto w-full max-w-xl rounded-2xl shadow-xl">
          <CardHeader>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <CardTitle className="mt-4 text-2xl md:text-3xl">Masuk ke Sistem</CardTitle>
              <CardDescription className="mt-2">
                Gunakan email dan password akun Supabase Anda.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormField label="Email" error={errors.email?.message}>
                <Input type="email" placeholder="owner@bisnisanda.id" {...register("email")} />
              </FormField>
              <FormField label="Password" error={errors.password?.message}>
                <Input type="password" placeholder="Masukkan password" {...register("password")} />
              </FormField>
              <Button className="w-full" size="lg" type="submit" disabled={submitting}>
                {submitting ? "Memproses..." : "Masuk"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

