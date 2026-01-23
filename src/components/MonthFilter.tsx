'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

export default function MonthFilter({ 
  currentDate, 
  onMonthChange 
}: { 
  currentDate: Date, 
  onMonthChange: (date: Date) => void 
}) {
  
  // 1. Generate 12 Bulan ke Belakang untuk Opsi Pilihan
  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    d.setDate(1); // Set tanggal 1 agar aman
    months.push(d);
  }

  // Helper: Ubah Date object jadi string "YYYY-MM" untuk value Select
  const toValue = (date: Date) => date.toISOString().slice(0, 7); // "2026-01"

  // Helper: Format tampilan "Januari 2026"
  const formatLabel = (date: Date) => 
    date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-1 flex items-center border border-white/20">
      <Select 
        value={toValue(currentDate)} 
        onValueChange={(val) => onMonthChange(new Date(`${val}-01`))}
      >
        <SelectTrigger className="w-40 bg-transparent border-none text-white focus:ring-0 focus:ring-offset-0 font-medium h-9">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-200" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={toValue(m)} value={toValue(m)}>
              {formatLabel(m)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}