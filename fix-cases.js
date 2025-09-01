#!/usr/bin/env node

// Quick script to populate Appwrite with working cases that have AI summaries
const { Client, Databases, ID } = require('node-appwrite');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function fixCases() {
  try {
    console.log('🔧 Fixing cases in Appwrite...\n');
    
    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
      
    const databases = new Databases(client);
    
    // Read the working cases with AI summaries
    const casesData = JSON.parse(fs.readFileSync('./data/cases/2025/09/01.json', 'utf-8'));
    console.log(`Found ${casesData.length} cases with AI summaries`);
    
    // Clear existing cases
    console.log('Clearing old cases...');
    const existing = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID,
      process.env.NEXT_PUBLIC_APPWRITE_CASES_COL_ID
    );
    
    for (const doc of existing.documents) {
      try {
        await databases.deleteDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID,
          process.env.NEXT_PUBLIC_APPWRITE_CASES_COL_ID,
          doc.$id
        );
      } catch (e) {
        console.log('Failed to delete:', doc.$id);
      }
    }
    
    // Add the working cases with summaries
    console.log('Adding cases with AI summaries...');
    let successCount = 0;
    
    for (const caseData of casesData.slice(0, 5)) { // Just add 5 good cases
      try {
        await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID,
          process.env.NEXT_PUBLIC_APPWRITE_CASES_COL_ID,
          ID.unique(),
          {
            id: caseData.id,
            type: 'case',
            data: JSON.stringify(caseData),
          }
        );
        successCount++;
        console.log(`✅ Added: ${caseData.parties.title.substring(0, 60)}...`);
      } catch (error) {
        console.error(`❌ Failed to add case: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Successfully added ${successCount} cases with AI summaries!`);
    console.log('Your app should now show proper case content.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixCases();

