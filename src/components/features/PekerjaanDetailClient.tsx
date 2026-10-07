"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { CountdownBadge } from "./CountdownBadge";
import { SubmitModal } from "./SubmitModal";
import { ReviewModal } from "./ReviewModal";
import { formatDateIndo, formatDateTimeIndo } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  User,
  Shield,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  RotateCcw,
  Send,
  Play,
  FileText,
  History,
  Layers,
  Building2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { startWorkAction } from "@/actions/worktrack-actions";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";

interface PeriodDetail {
  id: string;
  periodLabel: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  deadlineFinal?: Date | string | null;
  deadlineSubmit: Date | string;
  meetingDate?: Date | string | null;
  status: string;
  createdAt: Date | string;
  assignment: {
    id: string;
    targetFinal?: string | null;
    targetSubmit?: string | null;
    meetingDate?: string | null;
    report: {
      id: string;
      name: string;
      description?: string | null;
      code?: string | null;
      frequency: string;
      defaultDepartment?: string | null;
    };
    user: {
      id: string;
      name: string;
      email: string;
      department?: string | null;
    };
    pic?: {
      id: string;
      name: string;
      email: string;
    } | null;
    reviewer?: {
      id: string;
      name: string;
      email: string;
    } | null;
  };
  submissions: Array<{
    id: string;
    reportPeriodId: string;
    version: number;
    fileName: string;
    fileUrl?: string | null;
    notes?: string | null;
    reviewNotes?: string | null;
    status: string;
    submittedAt: Date | string;
    reviewedAt?: Date | string | null;
    submittedBy: {
      id: string;
      name: string;
      department?: string | null;
    };
    reviewedBy?: {
      id: string;
      name: string;
    } | null;
  }>;
}

interface PekerjaanDetailClientProps {
  period: PeriodDetail;
  currentUserId?: string;
  currentUserRole?: string;
}

export function PekerjaanDetailClient({
  period,
  currentUserId,
  currentUserRole,
}: PekerjaanDetailClientProps) {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState<any>(null);
  const [starting, setStarting] = useState(false);

  // Live Countdown State
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: false });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const target = new Date(period.deadlineSubmit);
      const diffSec = Math.floor((target.getTime() - now.getTime()) / 1000);

      if (diffSec <= 0) {
        const absSec = Math.abs(diffSec);
        setTimeLeft({
          days: Math.floor(absSec / 86400),
          hours: Math.floor((absSec % 86400) / 3600),
          minutes: Math.floor((absSec % 3600) / 60),
          seconds: absSec % 60,
          isOverdue: true,
        });
      } else {
        setTimeLeft({
          days: Math.floor(diffSec / 86400),
          hours: Math.floor((diffSec % 86400) / 3600),
          minutes: Math.floor((diffSec % 3600) / 60),
          seconds: diffSec % 60,
          isOverdue: false,
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [period.deadlineSubmit]);

  const report = period.assignment.report;
  const user = period.assignment.user;
  const pic = period.assignment.pic;
  const reviewer = period.assignment.reviewer;

  const isApproved = period.status === "APPROVED";
  const isPending = period.status === "PENDING";
  const isRevision = period.status === "REVISION";
  const isSubmittedOrReview = period.status === "SUBMITTED" || period.status === "UNDER_REVIEW";

  const isPicOrReviewerOrAdmin =
    currentUserRole === "ADMIN" ||
    currentUserRole === "PIC" ||
    currentUserRole === "REVIEWER" ||
    currentUserId === pic?.id ||
    currentUserId === reviewer?.id;

  const handleStartWork = async () => {
    setStarting(true);
    try {
      await startWorkAction(period.id);
    } finally {
      setStarting(false);
    }
  };

  const latestSubmission = period.submissions[period.submissions.length - 1];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            href="/pekerjaan"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Pekerjaan Saya</span>
          </Link>
          <div className="flex items-center gap-2.5 pt-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#008651] font-bold text-xs border border-emerald-200">
              Periode: {period.periodLabel}
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              {report.name}
            </h1>
          </div>
          {report.code && (
            <p className="text-xs text-slate-400 font-mono">Kode Laporan: {report.code}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isPending && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={starting}
              onClick={handleStartWork}
              className="gap-1.5 border-slate-300 font-semibold"
            >
              <Play className="h-3.5 w-3.5 text-[#0055A5]" />
              <span>Mulai Kerjakan</span>
            </Button>
          )}

          {!isApproved && (
            <Button
              type="button"
              variant="pertamina"
              size="sm"
              onClick={() => setIsSubmitModalOpen(true)}
              className="gap-1.5 shadow-xs font-bold bg-[#008651] hover:bg-[#007244] text-white"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isRevision ? "Submit Revisi" : "Submit Pekerjaan"}</span>
            </Button>
          )}

          {isSubmittedOrReview && isPicOrReviewerOrAdmin && latestSubmission && (
            <Button
              type="button"
              variant="warning"
              size="sm"
              onClick={() => {
                setSelectedSubmissionForReview(latestSubmission);
                setIsReviewModalOpen(true);
              }}
              className="gap-1.5 shadow-xs font-bold"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Review Submission</span>
            </Button>
          )}
        </div>
      </div>

      {/* Prominent Corporate Countdown Box */}
      {!isApproved && (
        <div
          className={`rounded-xl border p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            timeLeft.isOverdue
              ? "bg-red-50/40 border-red-200 text-red-900"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#008651] animate-ping" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {timeLeft.isOverdue ? "Pekerjaan Melewati Batas Waktu (Overdue)" : "Sisa Waktu Menuju Deadline Submit"}
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Batas waktu: <strong className="text-slate-900">{formatDateIndo(period.deadlineSubmit)} • 17:00 WIB</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center bg-slate-900 text-white rounded-lg p-2.5 min-w-[64px] shadow-2xs">
              <span className="text-xl font-black font-mono leading-none">
                {String(timeLeft.days).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Days</span>
            </div>
            <span className="text-lg font-bold text-slate-400">:</span>
            <div className="flex flex-col items-center bg-slate-900 text-white rounded-lg p-2.5 min-w-[64px] shadow-2xs">
              <span className="text-xl font-black font-mono leading-none">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Hours</span>
            </div>
            <span className="text-lg font-bold text-slate-400">:</span>
            <div className="flex flex-col items-center bg-slate-900 text-white rounded-lg p-2.5 min-w-[64px] shadow-2xs">
              <span className="text-xl font-black font-mono leading-none">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Mins</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Details (Left) + Workflow Timeline & History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stakeholder Matrix & Parameters */}
        <div className="lg:col-span-4 space-y-5">
          {/* Status Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Status Pekerjaan
            </h2>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Status Saat Ini:</span>
              <StatusBadge status={period.status} size="lg" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target Draft (Final):</span>
                <span className="font-semibold text-slate-800">
                  {period.deadlineFinal ? `Tgl ${formatDateIndo(period.deadlineFinal)}` : "Tgl 2"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target Submit:</span>
                <span className="font-bold text-[#0055A5]">
                  {formatDateIndo(period.deadlineSubmit)} • 17:00
                </span>
              </div>

              {period.meetingDate && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Jadwal Rapat User:</span>
                  <span className="font-semibold text-slate-800">
                    {formatDateIndo(period.meetingDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stakeholders Matrix */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Informasi Penanggung Jawab
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold shrink-0">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Assignee (User Pelaksana)</p>
                  <p className="font-bold text-slate-900">{user.name}</p>
                  <p className="text-slate-500">{user.department || "SPBD"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2.5 border-t border-slate-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-[#008651] font-bold shrink-0 border border-emerald-100">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Person In Charge (PIC)</p>
                  <p className="font-bold text-slate-900">{pic?.name || "-"}</p>
                  <p className="text-slate-500">{pic?.email || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2.5 border-t border-slate-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[#0055A5] font-bold shrink-0 border border-blue-100">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Reviewer / Approver</p>
                  <p className="font-bold text-slate-900">{reviewer?.name || "-"}</p>
                  <p className="text-slate-500">{reviewer?.email || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Guide */}
          {report.description && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Panduan Cut-Off &amp; Format
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">{report.description}</p>
            </div>
          )}
        </div>

        {/* Right Column: Submission History & Workflow Timeline */}
        <div className="lg:col-span-8 space-y-5">
          {/* Submission History */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-[#008651]" />
                <h2 className="text-sm font-bold text-slate-900">Riwayat Submission (History)</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Total <strong>{period.submissions.length}</strong> Versi Submission
              </span>
            </div>

            {period.submissions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">Belum ada berkas submission untuk periode ini.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Klik tombol &quot;Submit Pekerjaan&quot; untuk mengirimkan laporan.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {period.submissions.map((sub) => {
                  const isSubApproved = sub.status === "APPROVED";
                  const isSubRevision = sub.status === "REVISION";
                  const isSubUnderReview = sub.status === "UNDER_REVIEW" || sub.status === "SUBMITTED";

                  return (
                    <div
                      key={sub.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSubApproved
                          ? "bg-emerald-50/30 border-emerald-200"
                          : isSubRevision
                          ? "bg-rose-50/30 border-rose-200"
                          : "bg-slate-50/60 border-slate-200"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-slate-200/70">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                            Versi #{sub.version}
                          </span>
                          <span className="text-xs text-slate-600 font-medium">
                            Disubmit oleh <strong>{sub.submittedBy.name}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatDateTimeIndo(sub.submittedAt)}
                          </span>
                          <StatusBadge status={sub.status} size="sm" />
                        </div>
                      </div>

                      {/* File Details */}
                      <div className="py-2.5 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <FileText className="h-5 w-5 text-[#0055A5] mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-mono font-bold text-slate-800 truncate">
                              {sub.fileName}
                            </p>
                            {sub.notes && (
                              <p className="text-xs text-slate-600 mt-0.5 italic">
                                &quot;{sub.notes}&quot;
                              </p>
                            )}
                          </div>
                        </div>

                        {sub.fileUrl && (
                          <a
                            href={`/api/submissions/${sub.id}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#0055A5] hover:underline font-semibold shrink-0"
                          >
                            <span>Buka Cloud</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      {/* Review Outcome */}
                      {sub.reviewedBy && (
                        <div className="mt-2 pt-2 border-t border-slate-200/70 text-xs flex items-start gap-2">
                          {isSubApproved ? (
                            <CheckCircle2 className="h-4 w-4 text-[#008651] shrink-0 mt-0.5" />
                          ) : (
                            <RotateCcw className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">
                                {isSubApproved ? "Disetujui (Approved)" : "Permintaan Revisi"} oleh {sub.reviewedBy.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {formatDateTimeIndo(sub.reviewedAt)}
                              </span>
                            </div>
                            {sub.reviewNotes && (
                              <p
                                className={`text-[11px] p-2 rounded border mt-1 italic ${
                                  isSubApproved
                                    ? "bg-emerald-50 text-[#006837] border-emerald-200"
                                    : "bg-rose-50 text-rose-800 border-rose-200"
                                }`}
                              >
                                &quot;{sub.reviewNotes}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Review Action Trigger for Reviewer */}
                      {isSubUnderReview && isPicOrReviewerOrAdmin && (
                        <div className="mt-3 pt-2 border-t border-slate-200/70 flex justify-end">
                          <Button
                            type="button"
                            variant="warning"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmissionForReview(sub);
                              setIsReviewModalOpen(true);
                            }}
                            className="h-7 text-xs font-bold shadow-2xs"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Review Submission Ini
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Workflow Timeline */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Clock className="h-4 w-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-900">Alur Linimasa &amp; Approval</h2>
            </div>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Step 1: Penugasan */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 h-3 w-3 rounded-full bg-[#008651] ring-4 ring-white" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">1. Tugas Dibuat &amp; Di-assign</p>
                  <p className="text-slate-500">Ditugaskan kepada {user.name} ({user.department || "SPBD"}).</p>
                </div>
              </div>

              {/* Step 2: Mulai Bekerja */}
              <div className="relative">
                <div
                  className={`absolute -left-6 top-0.5 h-3 w-3 rounded-full ring-4 ring-white ${
                    !isPending ? "bg-[#008651]" : "bg-slate-300"
                  }`}
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">2. Proses Pengerjaan</p>
                  <p className="text-slate-500">
                    {!isPending ? "Assignee telah mulai mengerjakan laporan." : "Menunggu assignee memulai pengerjaan."}
                  </p>
                </div>
              </div>

              {/* Step 3: Submission */}
              <div className="relative">
                <div
                  className={`absolute -left-6 top-0.5 h-3 w-3 rounded-full ring-4 ring-white ${
                    period.submissions.length > 0 ? "bg-[#008651]" : "bg-slate-300"
                  }`}
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">3. Penyerahan Laporan (Submit)</p>
                  <p className="text-slate-500">
                    {period.submissions.length > 0
                      ? `Laporan disubmit (${period.submissions.length} kali penyerahan).`
                      : "Belum ada berkas yang dikirimkan."}
                  </p>
                </div>
              </div>

              {/* Step 4: Approval */}
              <div className="relative">
                <div
                  className={`absolute -left-6 top-0.5 h-3 w-3 rounded-full ring-4 ring-white ${
                    isApproved ? "bg-[#008651]" : isRevision ? "bg-rose-500" : "bg-slate-300"
                  }`}
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">4. Review &amp; Approval Akhir</p>
                  <p className="text-slate-500">
                    {isApproved
                      ? `Disetujui penuh oleh ${reviewer?.name || "Reviewer"}. Laporan tuntas.`
                      : isRevision
                      ? "Reviewer meminta perbaikan revisi kepada assignee."
                      : "Menunggu peninjauan dan approval."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <SubmitModal
        open={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
        periodId={period.id}
        reportName={report.name}
        periodLabel={period.periodLabel}
        versionNumber={period.submissions.length + 1}
      />

      {/* Review Modal */}
      {selectedSubmissionForReview && (
        <ReviewModal
          open={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          submission={selectedSubmissionForReview}
          reportName={report.name}
          periodLabel={period.periodLabel}
        />
      )}
    </div>
  );
}
