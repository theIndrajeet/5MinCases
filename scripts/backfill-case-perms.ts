#!/usr/bin/env tsx
// One-time backfill: ensure case documents have public read + server write permissions

import { databases, DB_ID, CASES_COL_ID } from '../lib/appwrite-server'
import { Permission, Role, Query } from 'node-appwrite'

async function backfill() {
  console.log('Starting backfill for case document permissions...')
  const pageSize = 100
  let offset = 0
  let processed = 0
  let updated = 0

  while (true) {
    const res = await databases.listDocuments(DB_ID, CASES_COL_ID, [
      Query.limit(pageSize),
      Query.offset(offset),
    ])

    if (!res.documents || res.documents.length === 0) break

    for (const doc of res.documents as any[]) {
      processed++

      const perms: string[] = doc.$permissions ?? []
      const hasPublicRead = perms.some((p) => p.startsWith('read(')) && perms.includes(Permission.read(Role.any()))

      if (!hasPublicRead) {
        try {
          await databases.updateDocument(
            DB_ID,
            CASES_COL_ID,
            doc.$id,
            {},
            [
              Permission.read(Role.any()),
              Permission.write(Role.team('server')),
            ],
          )
          updated++
          console.log(`Updated permissions for doc ${doc.$id}`)
        } catch (err: any) {
          console.error(`Failed to update doc ${doc.$id}:`, err?.message || err)
        }
      }
    }

    offset += res.documents.length
    if (res.documents.length < pageSize) break
  }

  console.log(`Backfill complete. Processed: ${processed}, Updated: ${updated}`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  backfill().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

export {}


