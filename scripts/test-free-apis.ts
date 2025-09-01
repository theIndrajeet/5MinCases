#!/usr/bin/env tsx
// Test script to verify which free legal APIs actually work

import fetch from 'node-fetch'

async function testCourtListenerV4() {
  console.log('\n🏛️ Testing CourtListener V4 API (FREE)...')
  
  try {
    // Try the V4 API
    const response = await fetch('https://www.courtlistener.com/api/rest/v4/search/', {
      headers: {
        'User-Agent': '5MinCase/1.0 (legal research tool)'
      }
    })
    
    console.log('Status:', response.status)
    const text = await response.text()
    console.log('Response:', text.substring(0, 200))
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message)
    } else {
      console.error('Unexpected error:', error)
    }
  }
}

async function testJustiaFree() {
  console.log('\n⚖️ Testing Justia Free Cases...')
  
  try {
    // Justia has free case law
    const response = await fetch('https://supreme.justia.com/cases/federal/us/recent/', {
      headers: {
        'User-Agent': '5MinCase/1.0 (legal research tool)'
      }
    })
    
    console.log('Status:', response.status)
    const text = await response.text()
    
    // Look for case patterns
    const caseMatches = text.match(/[A-Z][a-z]+ v\. [A-Z][a-z]+/g)
    console.log('Found cases:', caseMatches?.slice(0, 5))
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message)
    } else {
      console.error('Unexpected error:', error)
    }
  }
}

async function testECourtsIndia() {
  console.log('\n🇮🇳 Testing eCourts India...')
  
  try {
    // eCourts portal
    const response = await fetch('https://main.sci.gov.in/', {
      headers: {
        'User-Agent': '5MinCase/1.0 (legal research tool)'
      }
    })
    
    console.log('Status:', response.status)
    const text = await response.text()
    
    // Look for judgment links
    const judgmentMatches = text.match(/judgment[s]?/gi)
    console.log('Found judgment references:', judgmentMatches?.length || 0)
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message)
    } else {
      console.error('Unexpected error:', error)
    }
  }
}

async function testBAILII() {
  console.log('\n🇬🇧 Testing BAILII UK...')
  
  try {
    // BAILII recent cases
    const response = await fetch('http://www.bailii.org/recent-decisions', {
      headers: {
        'User-Agent': '5MinCase/1.0 (legal research tool)'
      }
    })
    
    console.log('Status:', response.status)
    const text = await response.text()
    
    // Look for case citations
    const citations = text.match(/\[\d{4}\]\s+[A-Z]+/g)
    console.log('Found citations:', citations?.slice(0, 5))
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message)
    } else {
      console.error('Unexpected error:', error)
    }
  }
}

async function main() {
  console.log('🚀 Testing Free Legal Data APIs')
  console.log('===============================')
  
  await testCourtListenerV4()
  await testJustiaFree()
  await testECourtsIndia()
  await testBAILII()
  
  console.log('\n✅ Tests complete!')
}

main().catch(console.error)
