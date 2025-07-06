#!/usr/bin/env node

// Simple event monitoring script for MCP quotes-sse server
const SERVER_URL = 'http://localhost:3456';

console.log('🔍 MCP Event Monitor Starting...');
console.log(`📡 Monitoring server at: ${SERVER_URL}`);
console.log('⏰ Checking for events every 5 seconds...');
console.log('🎲 Trigger events manually with: curl http://localhost:3456/pushRandomQuote');
console.log('📊 Health check: curl http://localhost:3456/health');
console.log('───────────────────────────────────────────────────────────────\n');

let lastEventTime = null;
let eventCount = 0;

async function checkServerStatus() {
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    const data = await response.json();
    
    const currentTime = new Date().toISOString();
    console.log(`[${currentTime}] 📈 Health Check:`, {
      status: data.status,
      activeSessions: data.activeSessions,
      quotesLoaded: data.quotesLoaded,
      environment: data.environment
    });
    
    return data;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error checking server health:`, error.message);
    return null;
  }
}

async function triggerRandomEvent() {
  try {
    const response = await fetch(`${SERVER_URL}/pushRandomQuote`);
    const data = await response.json();
    
    const currentTime = new Date().toISOString();
    eventCount++;
    
    if (data.success) {
      console.log(`[${currentTime}] 🎉 Event #${eventCount} Triggered:`, {
        quote: data.quote,
        activeSessions: data.activeSessions,
        timestamp: data.timestamp
      });
      lastEventTime = currentTime;
    } else {
      console.log(`[${currentTime}] ⚠️  Event failed:`, data.message);
    }
    
    return data;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error triggering event:`, error.message);
    return null;
  }
}

// Check server health every 10 seconds
setInterval(checkServerStatus, 10000);

// Trigger random events every 15 seconds for demonstration
setInterval(triggerRandomEvent, 15000);

// Initial health check
checkServerStatus();

// Initial event trigger
setTimeout(triggerRandomEvent, 2000);

console.log('🚀 Monitor running... Press Ctrl+C to stop\n');