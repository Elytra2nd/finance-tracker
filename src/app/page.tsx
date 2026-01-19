import { formatRupiah } from "@/lib/utils";
import CategoryChart from "@/components/CategoryChart";
import ClientDashboard from "@/components/ClientDashboard";

// --- SERVER SIDE DATA FETCHING ---
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

export default async function Home() {
  const transactions = await getTransactions();

  // Hitung Data Summary di Server
  const totalIncome = transactions.filter((t: any) => t.type === "Income").reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t: any) => t.type === "Expense").reduce((sum: number, t: any) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    // Oper data ke Client Component untuk interaktivitas
    <ClientDashboard 
      transactions={transactions} 
      totalIncome={totalIncome} 
      totalExpense={totalExpense} 
      balance={balance} 
    />
  );
}