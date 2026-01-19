'use server'

export async function scanReceiptAction(formData: FormData) {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) throw new Error("API Key hilang. Cek Vercel.");

  const file = formData.get("file") as File;
  if (!file) throw new Error("Gambar tidak ditemukan.");

  // 1. Convert Image
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");
  const mimeType = file.type || "image/jpeg";

  // Fungsi Helper untuk memanggil API
  async function callGemini(modelName: string) {
    console.log(`📡 Mencoba connect dengan model: ${modelName}...`);
    
    const requestBody = {
      contents: [{
        parts: [
          { text: "Analisa struk ini. Return JSON murni: {description, amount (number), date (YYYY-MM-DD), category}. Tanpa markdown." },
          { inline_data: { mime_type: mimeType, data: base64Image } }
        ]
      }]
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || res.statusText);
    }
    return res.json();
  }

  // Fungsi untuk mengecek model apa yang SEBENARNYA tersedia
  async function listAvailableModels() {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
      const data = await res.json();
      console.log("📋 DAFTAR MODEL YANG TERSEDIA UNTUK KEY INI:");
      console.log(data.models?.map((m: any) => m.name).join(", ") || "Tidak ada model ditemukan");
    } catch (e) {
      console.error("Gagal list model:", e);
    }
  }

  try {
    // USAHA 1: Coba model terbaru (Flash)
    let data;
    try {
      data = await callGemini('gemini-1.5-flash');
    } catch (error: any) {
      console.error("❌ Gagal dengan gemini-1.5-flash.");
      
      // Jika error 404, kita cari tahu kenapa & coba model lama
      if (error.message.includes("not found") || error.message.includes("404")) {
        await listAvailableModels(); // <--- INI AKAN MENCETAK LIST MODEL DI LOGS VERCEL
        
        console.log("⚠️ Mengalihkan ke model cadangan: gemini-pro-vision");
        data = await callGemini('gemini-pro-vision'); // Model lama (biasanya lebih stabil di akun lama)
      } else {
        throw error;
      }
    }

    // Olah Data
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("AI tidak merespon teks.");
    
    const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    console.log("✅ Sukses:", cleanText);
    
    return JSON.parse(cleanText);

  } catch (error: any) {
    console.error("🔥 FINAL ERROR:", error.message);
    throw new Error(`Gagal Scan: ${error.message}`);
  }
}