#!/usr/bin/env tsx
// Clean old news from Appwrite database
// Removes news items older than specified days (default: 7 days)

import { databases, DB_ID, NEWS_COL_ID } from '../lib/appwrite-server'
import { Query } from 'node-appwrite'

const CLEANUP_DAYS = parseInt(process.env.CLEANUP_DAYS || '7')

async function cleanOldNews() {
  console.log(`Starting cleanup: removing news older than ${CLEANUP_DAYS} days...`)
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_DAYS)
  const cutoffISO = cutoffDate.toISOString()
  
  console.log(`Cutoff date: ${cutoffISO}`)
  
  let totalDeleted = 0
  let offset = 0
  const pageSize = 100
  
  while (true) {
    try {
      // Fetch news documents in batches
      const result = await databases.listDocuments(DB_ID, NEWS_COL_ID, [
        Query.limit(pageSize),
        Query.offset(offset)
      ])
      
      if (!result.documents || result.documents.length === 0) {
        break
      }
      
      const documentsToDelete: string[] = []
      
      // Check each document's publish date
      for (const doc of result.documents as any[]) {
        try {
          const newsData = JSON.parse(doc.data)
          const publishedDate = new Date(newsData.publishedDate)
          
          if (publishedDate < cutoffDate) {
            documentsToDelete.push(doc.$id)
            console.log(`Marking for deletion: ${newsData.title} (${publishedDate.toISOString()})`)
          }
        } catch (error) {
          console.warn(`Failed to parse document ${doc.$id}:`, error)
          // Skip malformed documents
        }
      }
      
      // Delete old documents
      for (const docId of documentsToDelete) {
        try {
          await databases.deleteDocument(DB_ID, NEWS_COL_ID, docId)
          totalDeleted++
          console.log(`Deleted document: ${docId}`)
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`Failed to delete document ${docId}:`, error)
        }
      }
      
      // If we processed fewer than pageSize documents, we're done
      if (result.documents.length < pageSize) {
        break
      }
      
      offset += result.documents.length
      
      // Rate limiting between batches
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error('Error during cleanup batch:', error)
      break
    }
  }
  
  console.log(`Cleanup complete. Deleted ${totalDeleted} old news items.`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanOldNews().catch((error) => {
    console.error('Cleanup failed:', error)
    process.exit(1)
  })
}

export { cleanOldNews }
