'use client'

import { useState } from "react";
import { Progress } from "@/components/ui/progress"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Pencil, Save, X } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { updateGoalAction } from "@/actions/goal";
import { toast } from "sonner";

export default function SavingsGoal({ 
  currentBalance, 
  goalName = "Target Tabungan", 
  goalAmount = 0 
}: { 
  currentBalance: number, 
  goalName?: string, 
  goalAmount?: number 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(goalName);
  const [tempAmount, setTempAmount] = useState(goalAmount);
  const [loading, setLoading] = useState(false);

  // Hitung Progress
  // Jika target 0, progress 0. Maksimal 100%.
  const percentage = goalAmount > 0 
    ? Math.min(100, Math.max(0, (currentBalance / goalAmount) * 100)) 
    : 0;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateGoalAction(tempName, Number(tempAmount));
      toast.success("Target berhasil disimpan!");
      setIsEditing(false);
    } catch (e) {
      toast.error("Gagal menyimpan target");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-teal-100 text-xs font-medium uppercase tracking-wider">Savings Goal</p>
              {isEditing ? (
                 <Input 
                   value={tempName} 
                   onChange={(e) => setTempName(e.target.value)} 
                   className="h-7 bg-white/20 border-none text-white placeholder-white/50 mt-1 focus-visible:ring-0"
                   placeholder="Nama Barang"
                 />
              ) : (
                 <h3 className="font-bold text-lg leading-tight">{goalName}</h3>
              )}
            </div>
          </div>
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          </Button>
        </div>

        {isEditing ? (
          <div className="mb-4">
             <p className="text-xs text-teal-100 mb-1">Target Harga (Rp)</p>
             <Input 
                type="number"
                value={tempAmount} 
                onChange={(e) => setTempAmount(Number(e.target.value))} 
                className="bg-white/20 border-none text-white"
             />
             <Button 
               onClick={handleSave} 
               disabled={loading}
               className="w-full mt-3 bg-white text-teal-700 hover:bg-teal-50"
             >
               {loading ? "Menyimpan..." : "Simpan Target"}
             </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-end mb-2">
               <p className="text-2xl font-bold">{Math.round(percentage)}%</p>
               <p className="text-sm text-teal-100 mb-1">
                 {formatRupiah(currentBalance)} / <span className="opacity-70">{formatRupiah(goalAmount)}</span>
               </p>
            </div>

            {/* Progress Bar Custom */}
            <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                 style={{ width: `${percentage}%` }}
               />
            </div>
            
            <p className="text-xs text-teal-100 mt-3 text-center opacity-80">
              {percentage >= 100 
                ? "🎉 Target Tercapai! Selamat!" 
                : `Semangat! Kurang ${formatRupiah(Math.max(0, goalAmount - currentBalance))} lagi.`}
            </p>
          </>
        )}
      </div>
    </div>
  );
}