import { Client } from "@notionhq/client";

// Inisialisasi Client
const notion = new Client({
  auth: process.env.NOTION_KEY,
});

// Gunakan DEFAULT EXPORT agar import-nya lebih mudah
export default notion;

export const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'Income' | 'Expense';
  date: string;
};

export const mapNotionToTransaction = (item: any): Transaction => {
  return {
    id: item.id,
    description: item.properties.Name.title[0]?.plain_text || "Tanpa Nama",
    amount: item.properties.Amount.number || 0,
    category: item.properties.Category.select?.name || "Uncategorized",
    type: item.properties.Type.select?.name || "Expense",
    date: item.properties.Date.date?.start || new Date().toISOString(),
  };
};