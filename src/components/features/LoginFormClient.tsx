"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loginAction } from "@/actions/worktrack-actions";
import {
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  UserCheck,
  Briefcase,
  Layers,
  ChevronDown,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import officialLogo from "@/image/WhatsApp Image 2026-10-05 at 13.36.35.jpeg";

interface DemoAccountItem {
  name: string;
  email: string;
  password: string;
  role: string;
  label: string;
  department: string;
  description: string;
  badgeClass: string;
}

const DEMO_ACCOUNTS_LIST: DemoAccountItem[] = [
  {
    name: "Demo Administrator",
    email: "demo.admin@nusantararegas.com",
    password: "DemoRegas2026!",
    role: "ADMIN",
    label: "Administrator",
    department: "IT & Digital Solution",
    description: "Kontrol penuh konfigurasi, master laporan, penugasan, dan user.",
    badgeClass: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
  {
    name: "Demo Operator Staff",
    email: "demo.user@nusantararegas.com",
    password: "DemoRegas2026!",
    role: "USER",
    label: "Staff / Assignee",
    department: "Distribusi Gas",
    description: "Penyusun laporan: unggah berkas submission, pantau deadline.",
    badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  },
  {
    name: "Demo PIC",
    email: "demo.pic@nusantararegas.com",
    password: "DemoRegas2026!",
    role: "PIC",
    label: "Person In Charge",
    department: "Operasional ORF",
    description: "Verifikator tahap 1: review berkas submission & permohonan revisi.",
    badgeClass: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  {
    name: "Demo Reviewer",
    email: "demo.reviewer@nusantararegas.com",
    password: "DemoRegas2026!",
    role: "REVIEWER",
    label: "Reviewer",
    department: "Manajemen Kepatuhan",
    description: "Pemberi persetujuan resmi (approval) dan evaluasi kepatuhan.",
    badgeClass: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  {
    name: "Demo Management",
    email: "demo.management@nusantararegas.com",
    password: "DemoRegas2026!",
    role: "MANAGEMENT",
    label: "Management (VP/Direksi)",
    department: "Executive Management",
    description: "Pemantau eksekutif: rekapitulasi progres bulanan & tren divisi.",
    badgeClass: "bg-emerald-100 dark:bg-emerald-950/60 text-[#008651] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
];

interface LoginFormClientProps {
  demoAccountsEnabled?: boolean;
}

export function LoginFormClient({ demoAccountsEnabled = false }: LoginFormClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successLogin, setSuccessLogin] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState<string | null>(null);
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  const handleSelectDemo = (item: DemoAccountItem) => {
    setEmail(item.email);
    setPassword(item.password);
    setSelectedDemoRole(item.label);
    setError(null);
  };

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
      setError("Terjadi kendala saat menghubungkan ke server autentikasi.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-100/70 dark:bg-[#090D16] p-4 md:p-8 transition-colors">
      {/* Absolute top-right Theme Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden min-h-[620px] transition-colors">
        {/* Left: Pertamina Nusantara Regas Visual Branding */}
        <div className="lg:col-span-6 bg-[#0B132B] dark:bg-[#070C1A] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden select-none">
          {/* Subtle Geometric Background Glows */}
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-[#008651]/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#0055A5]/25 blur-3xl pointer-events-none" />
          <div className="absolute right-10 bottom-10 w-48 h-48 rounded-full bg-[#DC2626]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white p-1.5 shadow-md border border-white/20">
                <Image
                  src={officialLogo}
                  alt="Pertamina Nusantara Regas"
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white block">
                  NUSANTARA REGAS
                </span>
                <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">
                  Pertamina Group • Jawa Barat ORF
                </span>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Enterprise Operational Platform 2026</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-snug">
                Penyaluran Andal. <br />
                <span className="text-[#00A651]">Kepatuhan Terjadwal.</span>
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed max-w-md pt-1">
                Sistem monitoring operasional terpadu untuk pengendalian jadwal pelaporan bulanan &amp; triwulanan, verifikasi dokumen berjenjang, kepatuhan cut-off, dan audit trail transparan.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Operasional &amp; Distribusi Gas</span>
            <span>Standar Keamanan Tinggi</span>
          </div>
        </div>

        {/* Right: Login Form & Demo Selector */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between bg-white dark:bg-slate-900 transition-colors">
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Selamat Datang Kembali
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Silakan masuk dengan akun korporat Anda untuk melanjutkan ke sistem operasional.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {successLogin && (
              <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Autentikasi berhasil! Mengarahkan ke Dashboard...</span>
              </div>
            )}

            {/* DEMO ACCOUNTS SELECTOR (Rendered only when demoAccountsEnabled is true) */}
            {demoAccountsEnabled && (
              <div className="mb-5 p-3 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0055A5] dark:text-sky-400">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Mode Demo: Pilih Akun Role</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDemoSelector(!showDemoSelector)}
                    className="text-[11px] font-semibold text-[#0055A5] dark:text-sky-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>{showDemoSelector ? "Tutup Pilihan" : "Lihat Akun"}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${showDemoSelector ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {selectedDemoRole && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Role aktif terpilih: <strong className="text-slate-900 dark:text-slate-100">{selectedDemoRole}</strong>. Klik tombol &ldquo;Masuk ke Sistem&rdquo; untuk login.
                  </p>
                )}

                {showDemoSelector && (
                  <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto">
                    {DEMO_ACCOUNTS_LIST.map((acc) => (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => handleSelectDemo(acc)}
                        className={`w-full text-left p-2 rounded-lg border text-xs transition-colors flex items-start justify-between gap-2 ${
                          email === acc.email
                            ? "border-[#008651] bg-emerald-50/70 dark:bg-emerald-950/40"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                              {acc.label}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${acc.badgeClass}`}>
                              {acc.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{acc.email}</p>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">{acc.description}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-[#008651] dark:text-emerald-400 shrink-0 mt-0.5">
                          Pilih
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Email Perusahaan</span>
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@nusantararegas.com"
                  className="text-xs h-10 border-slate-200 dark:border-slate-800 focus:border-[#008651] dark:focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <span>Kata Sandi</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
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
                    className="text-xs h-10 border-slate-200 dark:border-slate-800 focus:border-[#008651] dark:focus:border-emerald-500 pr-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 text-[#008651] focus:ring-[#008651]"
                  />
                  <span>Ingat saya</span>
                </label>
                <span className="text-[#0055A5] dark:text-sky-400 hover:underline cursor-pointer font-medium">
                  Bantuan Akses Akun
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

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              PT Nusantara Regas • Sistem Operasional Jadwal Pelaporan &amp; Kepatuhan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
