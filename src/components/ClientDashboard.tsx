'use client'

import { useState, useMemo, useEffect } from "react";
import { formatRupiah } from "@/lib/utils";
import CategoryChart from "./CategoryChart";
import TimeSeriesChart from "./TimeSeriesChart";
import TransactionItem from "./TransactionItem";
import TransactionForm from "./TransactionForm";
import ExportButton from "./ExportButton"; 
import BudgetSettings from "./BudgetSettings";
import MonthFilter from "./MonthFilter";
import AIAdvisor from "./AIAdvisor"; 
import SavingsGoal from "./SavingsGoal"; 
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet, Search, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes"; // <-- Import Theme

const ITEMS_PER_PAGE = 5; 

export default function ClientDashboard({ transactions, initialBudget, initialGoal }: any) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const { setTheme, theme } = useTheme(); // <-- Hook Theme
  
  // STATE DASHBOARD
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1); 

  const { 
    monthFilteredTransactions,
    displayTransactions,
    totalPages,
    totalIncome, 
    totalExpense, 
    balance 
  } = useMemo(() => {
    
    // 1. Filter Bulan
    const byMonth = transactions.filter((t: any) => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === selectedMonth.getMonth() &&
        tDate.getFullYear() === selectedMonth.getFullYear()
      );
    });

    // 2. Hitung Saldo
    const income = byMonth
      .filter((t: any) => t.type === 'Income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const expense = byMonth
      .filter((t: any) => t.type === 'Expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    // 3. Search
    const bySearch = byMonth.filter((t: any) => 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPg = Math.ceil(bySearch.length / ITEMS_PER_PAGE);

    return {
      monthFilteredTransactions: byMonth, 
      displayTransactions: bySearch,     
      totalPages: totalPg,
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    };
  }, [transactions, selectedMonth, searchQuery]); 

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, searchQuery]);

  const paginatedData = displayTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsSheetOpen(true);
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsSheetOpen(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28 font-sans transition-colors duration-300">
      {/* --- HEADER --- */}
      <div className="relative bg-linear-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 pt-8 pb-24 px-6 rounded-b-[2.5rem] shadow-xl overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute -top-12.5 -right-12.5 w-40 h-40 bg-white rounded-full blur-3xl"></div>
           <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-blue-300 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div className="flex justify-between items-center w-full md:w-auto">
              <div>
                <p className="text-blue-100 text-sm">Dashboard Keuangan</p>
                <h1 className="text-2xl font-bold text-white">Halo, Boss 👋</h1>
              </div>
              
              <div className="flex items-center gap-2">
                  {/* TOMBOL THEME TOGGLE */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/20 rounded-full"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </Button>

                  <div className="bg-white/10 p-1 rounded-xl backdrop-blur-md md:hidden">
                    <BudgetSettings currentBudget={initialBudget} />
                  </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
               <AIAdvisor transactions={monthFilteredTransactions} selectedDate={selectedMonth} />
               <MonthFilter currentDate={selectedMonth} onMonthChange={setSelectedMonth} />
               <div className="bg-white/10 p-1 rounded-xl backdrop-blur-md hidden md:block">
                 <BudgetSettings currentBudget={initialBudget} />
               </div>
            </div>
          </div>

          {/* Saldo Utama */}
          <div>
            <p className="text-blue-100 text-sm mb-1 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Saldo Bulan Ini
            </p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              {formatRupiah(balance)}
            </h2>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-16 relative z-20 space-y-6 max-w-4xl mx-auto">
        
        {/* --- SUMMARY CARDS --- */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-5 flex justify-between items-center border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 w-1/2 border-r border-gray-100 dark:border-gray-700 pr-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-full">
              <ArrowDownCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pemasukan</p>
              <p className="font-bold text-gray-800 dark:text-gray-100 text-sm md:text-base truncate">{formatRupiah(totalIncome)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-1/2 pl-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-full">
              <ArrowUpCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pengeluaran</p>
              <p className="font-bold text-gray-800 dark:text-gray-100 text-sm md:text-base truncate">{formatRupiah(totalExpense)}</p>
            </div>
          </div>
        </motion.div>

         {/* --- WIDGET TARGET TABUNGAN --- */}
         <motion.div
           initial={{ scale: 0.95, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.1 }}
         >
            <SavingsGoal 
              currentBalance={balance} 
              goalName={initialGoal?.name}
              goalAmount={initialGoal?.amount}
            />
         </motion.div>

        {/* --- EXPORT --- */}
        <div className="flex justify-end">
           <ExportButton transactions={monthFilteredTransactions} />
        </div>

        {/* --- CHARTS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
                <CategoryChart transactions={monthFilteredTransactions} />
            </motion.div>

            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}>
                <TimeSeriesChart transactions={monthFilteredTransactions} />
            </motion.div>
        </div>

        {/* --- LIST TRANSAKSI --- */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
            <h3 className="font-bold text-gray-800 dark:text-white text-lg">
              Riwayat {selectedMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h3>
            
            {/* SEARCH BAR */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Cari transaksi..." 
                  className="pl-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 rounded-xl focus-visible:ring-blue-500 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
          </div>

          <div className="space-y-3 pb-4">
            <AnimatePresence mode="popLayout">
              {paginatedData.length > 0 ? (
                paginatedData.map((t: any) => (
                  <TransactionItem key={t.id} transaction={t} onEdit={handleEdit} />
                ))
              ) : (
                <div className="text-center py-10 text-gray-400 border-dashed border dark:border-gray-700 rounded-2xl">
                  <p>Tidak ada data ditemukan.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="text-gray-500 dark:text-gray-400"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                    Halaman {currentPage} dari {totalPages}
                </span>

                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="text-gray-500 dark:text-gray-400"
                >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
          )}
        </div>
      </div>

      {/* --- FAB --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <Button 
              onClick={handleAddNew}
              className="pointer-events-auto bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full h-16 w-16 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 border-gray-50 dark:border-gray-900"
            >
              <Plus className="w-8 h-8" />
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-[2rem] h-[85vh] p-6 dark:bg-gray-900 dark:border-gray-800">
          <SheetHeader className="mb-6">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
            <SheetTitle className="text-center text-xl dark:text-white">
              {editingTransaction ? "Edit Transaksi" : "Tambah Transaksi Baru"}
            </SheetTitle>
          </SheetHeader>
          <TransactionForm initialData={editingTransaction} onSuccess={() => setIsSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    </main>
  );
}