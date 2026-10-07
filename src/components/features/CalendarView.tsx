"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { id } from "date-fns/locale";
import { StatusBadge } from "./StatusBadge";
import { CountdownBadge } from "./CountdownBadge";
import { formatDateIndo } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  X,
  Layers,
} from "lucide-react";

interface PeriodEvent {
  id: string;
  periodLabel: string;
  deadlineSubmit: Date | string;
  status: string;
  assignment: {
    report: {
      name: string;
      code?: string | null;
    };
    user: {
      name: string;
      department?: string | null;
    };
    pic?: {
      name: string;
    } | null;
  };
}

interface CalendarViewProps {
  periods: PeriodEvent[];
}

export function CalendarView({ periods }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 1)); // Default Oct 2026
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date(2026, 9, 5)); // Oct 5, 2026

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  // Map events by date string (yyyy-MM-dd)
  const eventsByDate = useMemo(() => {
    const map: Record<string, PeriodEvent[]> = {};
    periods.forEach((p) => {
      const d = new Date(p.deadlineSubmit);
      const key = format(d, "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [periods]);

  const selectedDayKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null;
  const selectedDayEvents = selectedDayKey ? eventsByDate[selectedDayKey] || [] : [];

  const handlePrevMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const handleNextMonth = () => setCurrentDate((d) => addMonths(d, 1));

  return (
    <div className="space-y-6">
      {/* Calendar Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#008651] border border-emerald-100">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {format(currentDate, "MMMM yyyy", { locale: id })}
            </h2>
            <p className="text-xs text-slate-500">
              Jadwal cut-off dan batas submit laporan bulanan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date(2026, 9, 1))}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-[#008651] hover:bg-emerald-100 transition-colors"
          >
            Oktober 2026
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid: Calendar Matrix (Left) + Selected Day Tasks Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs overflow-hidden">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span className="text-amber-600">Sab</span>
            <span className="text-red-600">Min</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {calendarDays.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const dayEvents = eventsByDate[dayKey] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;

              const hasOverdue = dayEvents.some((e) => e.status === "OVERDUE");
              const hasApproved = dayEvents.some((e) => e.status === "APPROVED");
              const hasPending = dayEvents.some((e) => e.status === "PENDING" || e.status === "IN_PROGRESS");

              return (
                <div
                  key={dayKey}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[85px] p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-[#008651] bg-emerald-50/40 ring-2 ring-[#008651]/20 shadow-xs"
                      : isCurrentMonth
                      ? "border-slate-100 bg-white hover:bg-slate-50"
                      : "border-slate-100/50 bg-slate-50/50 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? "text-[#008651] font-extrabold"
                          : isCurrentMonth
                          ? "text-slate-800"
                          : "text-slate-300"
                      }`}
                    >
                      {format(day, "d")}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-900 text-white">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Indicators / Chips */}
                  <div className="space-y-1 mt-1">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${
                          ev.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : ev.status === "OVERDUE"
                            ? "bg-red-100 text-red-800 font-bold"
                            : ev.status === "SUBMITTED" || ev.status === "UNDER_REVIEW"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {ev.assignment.report.name}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-semibold block">
                        +{dayEvents.length - 2} lainnya
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Tasks Panel */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Laporan Pada Tanggal
              </p>
              <h3 className="text-sm font-bold text-slate-900">
                {selectedDay ? formatDateIndo(selectedDay, "EEEE, dd MMMM yyyy") : "-"}
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#008651] border border-emerald-200">
              {selectedDayEvents.length} Jadwal
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {selectedDayEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-1 text-slate-300" />
                <p className="text-xs font-medium">Tidak ada batas submit pada tanggal ini.</p>
              </div>
            ) : (
              selectedDayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <StatusBadge status={ev.status} size="sm" />
                    <CountdownBadge deadline={ev.deadlineSubmit} status={ev.status} />
                  </div>

                  <div>
                    <Link
                      href={`/pekerjaan/${ev.id}`}
                      className="text-xs font-bold text-slate-900 hover:text-[#008651] block leading-snug transition-colors"
                    >
                      {ev.assignment.report.name}
                    </Link>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Assignee: <strong>{ev.assignment.user.name}</strong> ({ev.assignment.user.department || "SPBD"})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      PIC: <strong>{ev.assignment.pic?.name || "-"}</strong>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Batas Submit: 17:00 WIB
                    </span>
                    <Link
                      href={`/pekerjaan/${ev.id}`}
                      className="text-xs font-semibold text-[#008651] hover:text-[#007244] flex items-center gap-1 transition-colors"
                    >
                      <span>Buka Laporan</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
