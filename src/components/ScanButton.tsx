'use client'

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { scanReceiptAction } from "@/actions/scan";

export default function ScanButton({ onScanComplete }: { onScanComplete: (data: any) => void }) {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Panggil AI
      const data = await scanReceiptAction(formData);
      // Kirim hasil data ke Form utama
      onScanComplete(data);
    } catch (error) {
      alert("Gagal memproses gambar. Coba lagi.");
    } finally {
      setIsScanning(false);
      // Reset input agar bisa scan file yang sama lagi kalau mau
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        capture="environment" // Ini perintah agar HP langsung buka kamera belakang
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full gap-2 border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50 py-6 mb-4"
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
      >
        {isScanning ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sedang Menganalisa Struk...
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            Scan Struk Belanja (AI)
          </>
        )}
      </Button>
    </>
  );
}