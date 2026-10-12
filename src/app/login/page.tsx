import React from "react";
import { LoginFormClient } from "@/components/features/LoginFormClient";

export const metadata = {
  title: "Masuk — Nusantara Regas Sistem Operasional",
  description: "Portal masuk sistem monitoring jadwal laporan dan kepatuhan operasional PT Nusantara Regas.",
};

export default function LoginPage() {
  const demoAccountsEnabled = process.env.DEMO_ACCOUNTS_ENABLED === "true";

  return <LoginFormClient demoAccountsEnabled={demoAccountsEnabled} />;
}
