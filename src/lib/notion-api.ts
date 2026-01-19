const NOTION_KEY = process.env.NOTION_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

const headers = {
  "Authorization": `Bearer ${NOTION_KEY}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

// Fungsi untuk MENYIMPAN data baru
export async function createTransaction(data: {
  description: string;
  amount: number;
  category: string;
  type: string;
  date: string;
}) {
  const body = {
    parent: { database_id: DATABASE_ID },
    properties: {
      // Sesuai log JSON Anda: "Nama" (Title)
      "Nama": {
        title: [{ text: { content: data.description } }],
      },
      // Sesuai log JSON Anda: "amount" (huruf kecil)
      "amount": {
        number: data.amount,
      },
      // Sesuai log JSON Anda: "Category"
      "Category": {
        select: { name: data.category },
      },
      // Sesuai log JSON Anda: "Type"
      "Type": {
        select: { name: data.type },
      },
      // Sesuai log JSON Anda: "date" (huruf kecil)
      "date": {
        date: { start: data.date },
      },
    },
  };

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Gagal menyimpan ke Notion");
  }

  return await res.json();
}