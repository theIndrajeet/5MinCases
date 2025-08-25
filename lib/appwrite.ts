import { Client, Account, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);

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
