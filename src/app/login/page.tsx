"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/actions/worktrack-actions";
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import officialLogo from "@/image/WhatsApp Image 2026-10-05 at 13.36.35.jpeg";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successLogin, setSuccessLogin] = useState(false);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await loginAction(formData);
      if (res.success) {
        setSuccessLogin(true);
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 300);
      } else {
        setError(res.error || "Email atau kata sandi tidak valid.");
        setLoading(false);
      }
    } catch (err: any) {
      setError("Terjadi kendala saat menghubungkan ke server.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100/70 p-4 md:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden min-h-[600px]">
        {/* Left: Pertamina Corporate Visual Branding */}
        <div className="lg:col-span-6 bg-[#0F172A] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Geometric Background Shapes */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#008651]/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#0055A5]/20 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white p-1">
                <Image src={officialLogo} alt="Pertamina Nusantara Regas" priority className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white block">
                  WORKTRACK
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Nusantara Regas / Pertamina Group
                </span>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Internal Monitoring System 2026</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-snug">
                Work Smarter. <br />
                <span className="text-[#00A651]">Stay on Track.</span>
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed max-w-md pt-1">
                Sistem monitoring terpadu jadwal laporan bulanan &amp; triwulanan, pengaturan deadline individual per divisi, pelacakan submission, dan persetujuan bertingkat.
              </p>
            </div>
          </div>

        </div>

        {/* Right: Login Form */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sign in to your WorkTrack corporate account to continue.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {successLogin && (
              <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Autentikasi berhasil! Mengarahkan ke Dashboard...</span>
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>Email Perusahaan</span>
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@nusantararegas.com"
                  className="text-xs h-10 border-slate-200 focus:border-[#008651] focus:ring-[#008651]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Kata Sandi</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span>Sembunyikan</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>Lihat</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="text-xs h-10 border-slate-200 focus:border-[#008651] focus:ring-[#008651] pr-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-[#008651] focus:ring-[#008651]"
                  />
                  <span>Ingat saya</span>
                </label>
                <span className="text-[#0055A5] hover:underline cursor-pointer font-medium">
                  Lupa kata sandi?
                </span>
              </div>

              <Button
                type="submit"
                variant="pertamina"
                className="w-full text-xs font-bold py-2.5 h-10 mt-2 bg-[#008651] hover:bg-[#007244] text-white shadow-xs"
                disabled={loading || successLogin}
              >
                {loading || successLogin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              WorkTrack v1.0 • Enterprise Operational Schedule &amp; Compliance System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
