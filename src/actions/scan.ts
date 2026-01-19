'use server'

export async function scanReceiptAction(formData: FormData) {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    throw new Error("API Key Gemini hilang. Cek Environment Variables di Vercel.");
  }

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("Tidak ada gambar yang diupload");
  }

  try {
    // 1. Konversi Gambar ke Base64 (Manual)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // 2. Siapkan Data JSON untuk dikirim ke Google
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Analisa gambar struk belanja ini. Ekstrak data ke JSON murni:
              {
                "description": "Nama Toko (Singkat)",
                "amount": 0 (Angka saja, tanpa titik/koma),
                "date": "YYYY-MM-DD" (Asumsikan 2026 jika tidak ada tahun),
                "category": "Makan/Transport/Hiburan/Belanja/Tagihan/Lainnya" (Pilih satu yg paling cocok)
              }
              Return ONLY raw JSON string without markdown blocks.`
            },
            {
              inline_data: {
                mime_type: file.type || "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ]
    };

    // 3. Panggil API Google Langsung (Tanpa SDK)
    // Kita pakai model 'gemini-1.5-flash' yang paling standar URL-nya
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    );

    // 4. Cek apakah Google menolak (Error Handling Manual)
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", JSON.stringify(errorData, null, 2));
      throw new Error(`Gagal memproses AI: ${errorData.error?.message || response.statusText}`);
    }

    // 5. Olah Hasilnya
    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    
    // Bersihkan format Markdown (```json ... ```)
    const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    console.log("✅ Sukses Scan:", cleanText);
    
    return JSON.parse(cleanText);

  } catch (error: any) {
    console.error("❌ Error di Server Action:", error);
    throw new Error(error.message || "Gagal membaca struk.");
  }
}