import { Client, Account, Databases, ID, Query } from 'appwrite';

// Browser-only Appwrite client - NO JWT, only sessions
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);

/**
 * Ensure an anonymous session exists (for browser only)
 */
export async function ensureSession() {
  if (typeof window !== 'undefined') { // Only run in browser
    try {
      await account.get();
    } catch {
      await account.createAnonymousSession();
    }
  }
}

export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID!;
export const BOOKMARKS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_BOOKMARKS_COL_ID!;
export const CASES_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_CASES_COL_ID!;
export const NEWS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_NEWS_COL_ID!;

// Re-export commonly used functions
export { ID, Query };
