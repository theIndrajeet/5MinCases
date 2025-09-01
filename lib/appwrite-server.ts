import { Client, Databases, ID } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables for server-side scripts
dotenv.config({ path: '.env.local' });

// Server-side Appwrite client with API key authentication
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!); // Service API key for server-side

export const databases = new Databases(client);

// Export database IDs
export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID!;
export const CASES_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_CASES_COL_ID!;
export const NEWS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_NEWS_COL_ID!;

// Re-export ID for convenience
export { ID };

