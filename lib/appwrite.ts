import dotenv from 'dotenv';
// Load .env.local only for server scripts
if (typeof window === 'undefined') {
  dotenv.config({ path: '.env.local' });
}
// Import Appwrite SDK
import { Client, Account, Databases } from 'appwrite';

// Client will be initialized at runtime (client-side or in scripts after dotenv load)
const client = new Client();
// If a service API key is provided (for server scripts), use it as JWT
if (process.env.APPWRITE_API_KEY) {
  client.setJWT(process.env.APPWRITE_API_KEY);
}
if (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
}
if (process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  client.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
}

export const account = new Account(client as any);
export const databases = new Databases(client as any);

/**
 * Ensure an anonymous session exists
 */
export async function ensureSession() {
  try {
    await account.get();
  } catch {
    await account.createAnonymousSession();
  }
}

export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID!;
export const BOOKMARKS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_BOOKMARKS_COL_ID!;
export const CASES_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_CASES_COL_ID!;
export const NEWS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_NEWS_COL_ID!;
