import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");

// In-memory cache to maintain lightning-fast response times and data integrity during runtime
const memoryCache = new Map<string, unknown>();

export async function readJsonFile<T>(fileName: string): Promise<T> {
  if (memoryCache.has(fileName)) {
    return JSON.parse(JSON.stringify(memoryCache.get(fileName))) as T;
  }

  const filePath = path.join(DATA_DIR, fileName);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as T;
    memoryCache.set(fileName, parsed);
    return parsed;
  } catch (error) {
    console.error(`Error reading data file ${fileName}:`, error);
    throw new Error(`Failed to read dataset: ${fileName}`);
  }
}

export async function writeJsonFile<T>(fileName: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    memoryCache.set(fileName, JSON.parse(JSON.stringify(data)));
    const serialized = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, serialized, "utf-8");
  } catch (error) {
    console.error(`Error writing data file ${fileName}:`, error);
    throw new Error(`Failed to persist dataset: ${fileName}`);
  }
}
