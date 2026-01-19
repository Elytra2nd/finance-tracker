'use client'

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { formatRupiah, formatDate } from "@/lib/utils";

export default function ExportButton({ transactions }: { transactions: any[] }) {

  const handleExport = () => {
    // 1. Pisahkan Data
    const incomes = transactions.filter(t => t.type === 'Income');
    const expenses = transactions.filter(t => t.type === 'Expense');

    // 2. Siapkan Data Pemasukan untuk Excel
    const incomeData = incomes.map(t => ({
      Tanggal: formatDate(t.date),
      Keterangan: t.description,
      Kategori: t.category,
      Jumlah: t.amount // Biarkan angka asli agar bisa dijumlah di Excel
    }));

    // Tambahkan baris Total Pemasukan
    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    incomeData.push({
      Tanggal: '',
      Keterangan: 'TOTAL PEMASUKAN',
      Kategori: '',
      Jumlah: totalIncome
    });

    // 3. Siapkan Data Pengeluaran untuk Excel
    const expenseData = expenses.map(t => ({
      Tanggal: formatDate(t.date),
      Keterangan: t.description,
      Kategori: t.category,
      Jumlah: t.amount
    }));

    // Tambahkan baris Total Pengeluaran
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    expenseData.push({
      Tanggal: '',
      Keterangan: 'TOTAL PENGELUARAN',
      Kategori: '',
      Jumlah: totalExpense
    });

    // 4. Buat Workbook Excel
    const wb = XLSX.utils.book_new();

    // Buat Sheet Pemasukan
    const wsIncome = XLSX.utils.json_to_sheet(incomeData);
    XLSX.utils.book_append_sheet(wb, wsIncome, "Pemasukan");

    // Buat Sheet Pengeluaran
    const wsExpense = XLSX.utils.json_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(wb, wsExpense, "Pengeluaran");

    // 5. Download File
    const fileName = `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport}
      className="gap-2 bg-white text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800"
    >
      <Download className="w-4 h-4" />
      Export Excel
    </Button>
  );
}