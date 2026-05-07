import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SWIPES_FILE = path.join(DATA_DIR, "swipes.json");

export interface SwipeRecord {
  dogId: string;
  imageUrl: string;
  action: "like" | "dislike";
  username: string;
  timestamp: string;
}

export async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(SWIPES_FILE);
  } catch {
    await fs.writeFile(SWIPES_FILE, "[]", "utf-8");
  }
}

export async function readSwipes(): Promise<SwipeRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(SWIPES_FILE, "utf-8");
  return JSON.parse(raw) as SwipeRecord[];
}

export async function appendSwipe(record: SwipeRecord): Promise<SwipeRecord> {
  await ensureStore();
  const records = await readSwipes();
  records.push(record);
  await fs.writeFile(SWIPES_FILE, JSON.stringify(records, null, 2), "utf-8");
  return record;
}
