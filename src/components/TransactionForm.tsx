'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { addTransactionAction, updateTransactionAction } from "@/actions/transaction";
import ScanButton from "./ScanButton";
import { toast } from "sonner";
import { Pencil, List } from "lucide-react";

// Daftar Kategori Default
const DEFAULT_CATEGORIES = ["Makan", "Transport", "Hiburan", "Belanja", "Tagihan", "Lainnya"];

export default function TransactionForm({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: any, 
  onSuccess: () => void 
}) {
  const [loading, setLoading] = useState(false);
  
  // State untuk Mode Input Kategori (Select vs Manual)
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Makan",
    type: "Expense",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (initialData) {
      // Cek apakah kategori ada di daftar default
      const isDefault = DEFAULT_CATEGORIES.includes(initialData.category);
      setIsCustomCategory(!isDefault); // Jika tidak ada di daftar, berarti custom
      
      setFormData({
        description: initialData.description,
        amount: initialData.amount,
        category: initialData.category,
        type: initialData.type,
        date: new Date(initialData.date).toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  const handleScanResult = (result: any) => {
    // Saat scan, kita anggap itu kategori manual (custom) agar tidak dipaksa ke default
    // Kecuali AI benar-benar yakin.
    let cleanCategory = result.category;
    let isCustom = false;

    // Logic pembersihan kategori sederhana
    if (!DEFAULT_CATEGORIES.includes(cleanCategory)) {
        // Coba mapping ke default dulu
        if (cleanCategory.toLowerCase().includes("food")) cleanCategory = "Makan";
        else if (cleanCategory.toLowerCase().includes("office")) cleanCategory = "Belanja";
        else {
           // Jika tidak nemu mapping, biarkan apa adanya (Custom)
           isCustom = true;
        }
    }

    setIsCustomCategory(isCustom);
    setFormData((prev) => ({
      ...prev,
      description: result.description || "Struk Scan",
      amount: result.amount || "",
      category: cleanCategory, 
      date: result.date || new Date().toISOString().split('T')[0]
    }));

    toast.success("Scan Berhasil!", { description: "Data terisi otomatis." });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(data: FormData) {
    setLoading(true);
    try {
      if (initialData) {
        await updateTransactionAction(initialData.id, data);
        toast.success("Transaksi berhasil diupdate!");
      } else {
        await addTransactionAction(data);
        toast.success("Transaksi berhasil disimpan!");
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      {!initialData && (
        <ScanButton onScanComplete={handleScanResult} />
      )}

      <form action={handleSubmit} className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
        <div className="space-y-2">
          <Label>Nama Transaksi</Label>
          <Input 
            name="description" 
            value={formData.description} 
            onChange={(e) => handleChange("description", e.target.value)}
            required 
            placeholder="Cth: Beli Kopi" 
            className="font-bold text-gray-800 dark:text-gray-100 dark:bg-gray-800"
          />
        </div>

        <div className="space-y-2">
          <Label>Nominal (Rp)</Label>
          <Input 
            type="number" 
            name="amount" 
            value={formData.amount} 
            onChange={(e) => handleChange("amount", e.target.value)}
            required 
            placeholder="0" 
            className="text-lg dark:bg-gray-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipe</Label>
            <Select 
              name="type" 
              value={formData.type} 
              onValueChange={(val) => handleChange("type", val)}
            >
              <SelectTrigger className="dark:bg-gray-800"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Expense">Pengeluaran</SelectItem>
                <SelectItem value="Income">Pemasukan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
               <Label>Kategori</Label>
               {/* Tombol Switch Custom/List */}
               <button 
                 type="button" 
                 onClick={() => setIsCustomCategory(!isCustomCategory)}
                 className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
               >
                 {isCustomCategory ? <><List className="w-3 h-3"/> Pilih List</> : <><Pencil className="w-3 h-3"/> Custom</>}
               </button>
            </div>

            {isCustomCategory ? (
                // Input Manual
                <Input 
                  name="category"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="Ketik kategori bebas..."
                  className="dark:bg-gray-800"
                  required
                />
            ) : (
                // Dropdown Default
                <Select 
                  name="category" 
                  value={DEFAULT_CATEGORIES.includes(formData.category) ? formData.category : ""} 
                  onValueChange={(val) => handleChange("category", val)}
                >
                  <SelectTrigger className="dark:bg-gray-800">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            )}
            {/* Input hidden agar value tetap terkirim saat pakai Select */}
            {!isCustomCategory && <input type="hidden" name="category" value={formData.category} />}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tanggal</Label>
          <Input 
            type="date" 
            name="date" 
            value={formData.date} 
            onChange={(e) => handleChange("date", e.target.value)}
            className="dark:bg-gray-800"
          />
        </div>

        <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-bold shadow-lg dark:bg-blue-700 dark:hover:bg-blue-800" 
            disabled={loading}
        >
          {loading ? "Menyimpan..." : (initialData ? "Update Transaksi" : "Simpan Transaksi")}
        </Button>
      </form>
    </div>
  );
}