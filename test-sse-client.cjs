const EventSource = require('eventsource');
const fetch = require('node-fetch');

const serverUrl = 'http://127.0.0.1:3456';

async function run() {
  console.log('Initializing MCP session...');
  
  // Step 1: Send initialize request
  const initResponse = await fetch(`${serverUrl}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-sse-client'
        }
      }
    })
  });

  // Step 2: Check if the initialization was successful
  if (initResponse.status !== 200) {
      console.error(`Initialization failed! Server returned status: ${initResponse.status}`);
      try {
          const errorBody = await initResponse.json();
          console.error('Error Body:', JSON.stringify(errorBody, null, 2));
      } catch(e) {
          const errorBody = await initResponse.text();
          console.error('Error Body (not JSON):', errorBody);
      }
      return;
  }

  // Step 3: Get the session ID from the response header
  const sessionId = initResponse.headers.get('mcp-session-id');
  if (!sessionId) {
    console.error('Initialization succeeded, but mcp-session-id header was missing!');
    return;
  }
  console.log(`Session initialized successfully. ID: ${sessionId}`);

  // Step 4: Connect to the SSE stream using the session ID
  console.log('Connecting to SSE event stream...');
  const eventSource = new EventSource(`${serverUrl}/mcp`, {
    headers: { 'mcp-session-id': sessionId }
  });

  eventSource.onopen = () => {
    console.log('SSE connection opened. Waiting for notifications...');
    console.log('-> Now run ./sse-push.sh in another terminal.');
  };

  // Step 5: Listen for the specific named event
  eventSource.addEventListener('quotes/random-quote-pushed', (event) => {
    console.log('\n--- Notification Received ---');
    console.log('Event Name:', event.type);
    console.log('Data:', JSON.stringify(JSON.parse(event.data), null, 2));
    console.log('---------------------------\n');
  });

  eventSource.onerror = (err) => {
    console.error('EventSource Error:', err);
    eventSource.close();
  };
}

run().catch(err => {
    console.error("Client Script Error:", err);
});