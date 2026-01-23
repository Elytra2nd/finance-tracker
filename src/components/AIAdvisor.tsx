'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, Bot, Loader2 } from "lucide-react";
import { generateFinancialAdvice } from "@/actions/advisor";
import ReactMarkdown from "react-markdown"; // Optional: biar teksnya rapi, tapi pakai div biasa juga oke

export default function AIAdvisor({ transactions, selectedDate }: { transactions: any[], selectedDate: Date }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setAdvice(""); // Reset advice lama

    try {
      // 1. Hitung Ringkasan Data di Client
      const income = transactions
        .filter((t: any) => t.type === 'Income')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const expense = transactions
        .filter((t: any) => t.type === 'Expense')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const categorySummary = transactions
        .filter((t: any) => t.type === 'Expense')
        .reduce((acc: any, t: any) => {
           const cat = t.category || "Lainnya";
           acc[cat] = (acc[cat] || 0) + t.amount;
           return acc;
        }, {});

      const monthName = selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

      // 2. Panggil Server Action
      const result = await generateFinancialAdvice(income, expense, categorySummary, monthName);
      setAdvice(result);

    } catch (error) {
      setAdvice("Gagal mendapatkan saran. Coba lagi nanti ya!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={handleGenerate}
          className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg border-0 gap-2 w-full md:w-auto"
        >
          <Sparkles className="w-4 h-4" />
          Minta Saran AI
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bot className="w-6 h-6 text-purple-600" />
            Financial Advisor
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
              <p className="text-sm animate-pulse">Sedang menganalisa kebiasaan jajanmu...</p>
            </div>
          ) : (
            <div className="prose prose-sm prose-purple text-gray-700 leading-relaxed whitespace-pre-line">
              {/* Jika teksnya markdown bold (**), kita replace sedikit biar jadi bold beneran kalau tanpa library react-markdown */}
              {advice.split('**').map((chunk, i) => 
                i % 2 === 1 ? <strong key={i} className="text-purple-700">{chunk}</strong> : chunk
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}