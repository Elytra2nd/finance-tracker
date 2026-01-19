import { formatRupiah } from "@/lib/utils";
import CategoryChart from "@/components/CategoryChart";
import ClientDashboard from "@/components/ClientDashboard";

// --- 1. FETCH TRANSAKSI (Hanya Income & Expense) ---
async function getTransactions() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const apiKey = process.env.NOTION_KEY;
  if (!databaseId || !apiKey) return [];

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page_size: 50,
      // FILTER PENTING: Jangan ambil row 'Budget', cuma Income & Expense
      filter: {
        or: [
          { property: "Type", select: { equals: "Income" } },
          { property: "Type", select: { equals: "Expense" } }
        ]
      },
      sorts: [{ property: "date", direction: "descending" }],
    }),
    next: { revalidate: 0 },
  });

  if (!res.ok) return [];
  const data = await res.json();

  return data.results.map((item: any) => ({
    id: item.id,
    description: item.properties.Nama.title[0]?.plain_text || "Tanpa Nama",
    amount: item.properties.amount.number || 0,
    category: item.properties.Category.select?.name || "Lainnya",
    type: item.properties.Type.select?.name || "Expense",
    date: item.properties.date.date?.start || new Date().toISOString(),
  }));
}

// --- 2. FETCH BUDGET CONFIG (Hanya row konfigurasi) ---
async function getBudget() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const apiKey = process.env.NOTION_KEY;
  if (!databaseId || !apiKey) return 0;

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: "Type", select: { equals: "Budget" } },
          { property: "Nama", title: { equals: "BUDGET_CONFIG" } }
        ]
      }
    }),
    next: { revalidate: 0 },
  });

  const data = await res.json();
  // Ambil angka pertama, atau 0 jika belum diset
  return data.results[0]?.properties.amount.number || 0;
}

// --- KOMPONEN UTAMA ---
export default async function Home() {
  // Jalankan kedua fetch secara paralel agar lebih cepat
  const [transactions, currentBudget] = await Promise.all([
    getTransactions(),
    getBudget()
  ]);

  // Hitung Data Summary di Server
  const totalIncome = transactions
    .filter((t: any) => t.type === "Income")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t: any) => t.type === "Expense")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    // Oper data ke Client Component
    <ClientDashboard 
      transactions={transactions} 
      totalIncome={totalIncome} 
      totalExpense={totalExpense} 
      balance={balance}
      initialBudget={currentBudget} // <-- Oper data budget ke UI
    />
  );
}