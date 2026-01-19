'use client'

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { scanReceiptAction } from "@/actions/scan";

export default function ScanButton({ onScanComplete }: { onScanComplete: (data: any) => void }) {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FUNGSI KOMPRESI GAMBAR ---
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Kita set ukuran maksimal lebar 800px (cukup untuk AI membaca teks)
        const maxWidth = 800;
        const scale = maxWidth / img.width;
        
        // Jika gambar kecil, jangan di-resize
        if (scale >= 1) {
            canvas.width = img.width;
            canvas.height = img.height;
        } else {
            canvas.width = maxWidth;
            canvas.height = img.height * scale;
        }

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Kompres ke JPEG kualitas 0.7 (70%)
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Gagal kompresi"));
        }, "image/jpeg", 0.7);
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);

    try {
      // 1. Kompres dulu sebelum kirim
      const compressedBlob = await compressImage(file);
      
      // 2. Masukkan ke FormData
      const formData = new FormData();
      formData.append("file", compressedBlob, "receipt.jpg");

      // 3. Kirim ke Server Action
      const data = await scanReceiptAction(formData);
      onScanComplete(data);
    } catch (error) {
      console.error(error);
      alert("Gagal memproses gambar. Pastikan koneksi internet lancar.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        capture="environment"
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