#!/usr/bin/env tsx
// Test script to verify API keys are working

import { GoogleGenerativeAI } from '@google/generative-ai'

async function testGemini() {
  console.log('\n🔍 Testing Gemini API...')
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment')
    return false
  }
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const result = await model.generateContent('Say "Gemini API is working!" in exactly 5 words.')
    const response = result.response.text()
    
    console.log('✅ Gemini API Response:', response)
    return true
  } catch (error: any) {
    console.error('❌ Gemini API Error:', error.message)
    return false
  }
}

async function testPerplexity() {
  console.log('\n🔍 Testing Perplexity API...')
  
  if (!process.env.PERPLEXITY_API_KEY) {
    console.error('❌ PERPLEXITY_API_KEY not found in environment')
    return false
  }
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'user',
            content: 'Say "Perplexity API is working!" in exactly 5 words.'
          }
        ]
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    console.log('✅ Perplexity API Response:', data.choices[0].message.content)
    return true
  } catch (error: any) {
    console.error('❌ Perplexity API Error:', error.message)
    return false
  }
}

async function testLegalSummary() {
  console.log('\n🏛️ Testing Legal Summary Generation...')
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Cannot test without Gemini API key')
    return
  }
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `You are 5 Min Case AI. Generate a TL;DR in EXACTLY 60 words:
    
Case: State v. Smith
Court: Supreme Court
The defendant was convicted of theft. On appeal, they argued the evidence was insufficient. The court reviewed the CCTV footage and witness testimony.

Format: [WHO] held [WHAT] because [WHY]. This means [IMPACT].`
    
    const result = await model.generateContent(prompt)
    const tldr = result.response.text()
    
    const wordCount = tldr.trim().split(/\s+/).length
    console.log('\n📝 Generated TL;DR:')
    console.log(tldr)
    console.log(`\n📊 Word count: ${wordCount} ${wordCount === 60 ? '✅' : '❌ (should be 60)'}`)
  } catch (error: any) {
    console.error('❌ Summary generation failed:', error.message)
  }
}

async function main() {
  console.log('🚀 5 Min Case API Test Suite')
  console.log('============================')
  
  // Check for .env.local file
  const fs = await import('fs')
  if (!fs.existsSync('.env.local')) {
    console.error('\n❌ .env.local file not found!')
    console.log('\n📝 Please create .env.local with:')
    console.log('GEMINI_API_KEY=your_gemini_key')
    console.log('PERPLEXITY_API_KEY=your_perplexity_key')
    process.exit(1)
  }
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' })
  
  // Run tests
  const geminiOk = await testGemini()
  const perplexityOk = await testPerplexity()
  
  if (geminiOk && perplexityOk) {
    await testLegalSummary()
    console.log('\n✅ All APIs are working! You can now run the scraper.')
  } else {
    console.log('\n❌ Some APIs failed. Please check your keys.')
  }
}

main().catch(console.error)
