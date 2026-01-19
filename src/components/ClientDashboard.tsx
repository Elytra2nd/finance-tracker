'use client'

import { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import CategoryChart from "./CategoryChart";
import TransactionItem from "./TransactionItem";
import TransactionForm from "./TransactionForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientDashboard({ transactions, totalIncome, totalExpense, balance }: any) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  // Fungsi saat tombol Edit diklik
  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsSheetOpen(true);
  };

  // Fungsi saat tombol Tambah (+) diklik
  const handleAddNew = () => {
    setEditingTransaction(null); // Pastikan form kosong
    setIsSheetOpen(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24 font-sans relative">
      {/* --- HEADER --- */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-blue-600 text-white p-6 pb-12 rounded-b-3xl shadow-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Keuanganku 🚀</h1>
        </div>
        <div className="text-center">
          <p className="text-blue-100 text-sm mb-1">Total Saldo</p>
          <h2 className="text-4xl font-bold">{formatRupiah(balance)}</h2>
        </div>
      </motion.div>

      {/* --- SUMMARY CARDS --- */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 -mt-8 mb-6"
      >
        <div className="bg-white rounded-2xl shadow-md p-4 flex justify-between items-center border border-gray-100">
           {/* Sama seperti sebelumnya */}
           <div className="w-1/2 border-r border-gray-100 pr-4">
            <p className="text-xs text-gray-500 mb-1">Pemasukan</p>
            <p className="font-bold text-green-600 truncate">{formatRupiah(totalIncome)}</p>
          </div>
          <div className="w-1/2 pl-4">
            <p className="text-xs text-gray-500 mb-1">Pengeluaran</p>
            <p className="font-bold text-red-600 truncate">{formatRupiah(totalExpense)}</p>
          </div>
        </div>
      </motion.div>

      {/* --- CHART --- */}
      <div className="px-6">
        <CategoryChart transactions={transactions} />
      </div>

      {/* --- LIST TRANSAKSI --- */}
      <div className="px-6 mt-4">
        <h3 className="font-bold text-gray-800 mb-4 text-lg">Riwayat Transaksi</h3>
        <div className="space-y-3">
          <AnimatePresence>
            {transactions.map((t: any) => (
              <TransactionItem key={t.id} transaction={t} onEdit={handleEdit} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* --- SHEET (FORM MODAL) & FAB --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
            <Button 
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-14 w-14 shadow-xl flex items-center justify-center transition-all hover:scale-105"
            >
              <Plus className="w-8 h-8" />
            </Button>
          </div>
        </SheetTrigger>
        
        <SheetContent side="bottom" className="rounded-t-3xl h-[85vh]">
          <SheetHeader>
            <SheetTitle>{editingTransaction ? "Edit Transaksi" : "Transaksi Baru"}</SheetTitle>
          </SheetHeader>
          
          {/* Form dipanggil di sini */}
          <TransactionForm 
            initialData={editingTransaction} 
            onSuccess={() => setIsSheetOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </main>
  );
}