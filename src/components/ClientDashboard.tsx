'use client'

import { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import CategoryChart from "./CategoryChart";
import TimeSeriesChart from "./TimeSeriesChart"; // <-- Import Grafik Baru
import TransactionItem from "./TransactionItem";
import TransactionForm from "./TransactionForm";
import ExportButton from "./ExportButton"; 
import BudgetSettings from "./BudgetSettings";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientDashboard({ transactions, totalIncome, totalExpense, balance, initialBudget }: any) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsSheetOpen(true);
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsSheetOpen(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-28 font-sans">
      {/* --- HEADER MODERN DENGAN GRADASI --- */}
      <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 pt-8 pb-24 px-6 rounded-b-[2.5rem] shadow-xl overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-blue-300 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-blue-100 text-sm">Selamat Datang,</p>
              <h1 className="text-2xl font-bold text-white">Boss Keuangan 👋</h1>
            </div>
            {/* Tombol Setting Budget */}
            <div className="bg-white/10 p-1 rounded-xl backdrop-blur-md">
               <BudgetSettings currentBudget={initialBudget} />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-blue-100 text-sm mb-1 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Total Saldo
            </p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              {formatRupiah(balance)}
            </h2>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-16 relative z-20 space-y-6 max-w-4xl mx-auto">
        
        {/* --- SUMMARY CARDS (GLASS EFFECT) --- */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl shadow-lg p-5 flex justify-between items-center border border-gray-100"
        >
          <div className="flex items-center gap-3 w-1/2 border-r border-gray-100 pr-4">
            <div className="p-3 bg-green-50 rounded-full">
              <ArrowDownCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pemasukan</p>
              <p className="font-bold text-gray-800 text-sm md:text-base truncate">{formatRupiah(totalIncome)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-1/2 pl-4">
            <div className="p-3 bg-red-50 rounded-full">
              <ArrowUpCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pengeluaran</p>
              <p className="font-bold text-gray-800 text-sm md:text-base truncate">{formatRupiah(totalExpense)}</p>
            </div>
          </div>
        </motion.div>

        {/* --- TOMBOL EXPORT (Kecil di kanan) --- */}
        <div className="flex justify-end">
           <ExportButton transactions={transactions} />
        </div>

        {/* --- CHART SECTION (GRID LAYOUT) --- */}
        {/* Di HP: Atas-Bawah, Di Laptop: Kiri-Kanan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {/* GRAFIK DONAT (Kategori) */}
                <CategoryChart transactions={transactions} />
            </motion.div>

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                {/* GRAFIK TIME SERIES (Tren Harian) */}
                <TimeSeriesChart transactions={transactions} />
            </motion.div>
        </div>

        {/* --- RECENT TRANSACTIONS --- */}
        <div>
          <h3 className="font-bold text-gray-800 mb-4 text-lg px-1">Riwayat Transaksi</h3>
          <div className="space-y-3 pb-8">
            <AnimatePresence>
              {transactions.length > 0 ? (
                transactions.map((t: any) => (
                  <TransactionItem key={t.id} transaction={t} onEdit={handleEdit} />
                ))
              ) : (
                <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed">
                  <p>Belum ada transaksi.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* --- FLOATING ACTION BUTTON (FAB) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <Button 
              onClick={handleAddNew}
              className="pointer-events-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full h-16 w-16 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 border-gray-50"
            >
              <Plus className="w-8 h-8" />
            </Button>
          </div>
        </SheetTrigger>
        
        <SheetContent side="bottom" className="rounded-t-[2rem] h-[85vh] p-6">
          <SheetHeader className="mb-6">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
            <SheetTitle className="text-center text-xl">
              {editingTransaction ? "Edit Transaksi" : "Tambah Transaksi Baru"}
            </SheetTitle>
          </SheetHeader>
          
          <TransactionForm 
            initialData={editingTransaction} 
            onSuccess={() => setIsSheetOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </main>
  );
}