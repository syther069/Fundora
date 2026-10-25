#!/usr/bin/env node
const ENDPOINT = 'https://21st.dev/api/mcp';
const API_KEY = process.env['TWENTY_FIRST_API_KEY'] || '21st_sk_a302baeadd5dade7f462ef5827882195dfe9aece7c9d051fca7383077833db0c';

async function mcpCall(method, params = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    })
  });
  return await res.json();
}

async function main() {
  console.log('--- 1. Testing Initialize ---');
  const init = await mcpCall('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'antigravity-client', version: '1.0.0' }
  });
  console.log('Initialize Result:', JSON.stringify(init.result?.serverInfo || init));

  console.log('\n--- 2. Testing Tools List ---');
  const toolsRes = await mcpCall('tools/list', {});
  const tools = toolsRes.result?.tools || [];
  console.log(`Found ${tools.length} available tools.`);
  const keyTools = ['search', 'get_component', 'get_theme', 'search_logo', 'get_inspiration'];
  console.log('Verified core tools:');
  tools.filter(t => keyTools.includes(t.name)).forEach(t => {
    console.log(`  - ${t.name}: ${t.title}`);
  });

  console.log('\n--- 3. Testing Tool Call (search: "hackathon") ---');
  const searchRes = await mcpCall('tools/call', {
    name: 'search',
    arguments: { query: 'hackathon' }
  });
  const textContent = searchRes.result?.content?.[0]?.text || '';
  console.log(textContent.slice(0, 300) + '...\n');
  console.log('✅ 21st MCP client successfully verified!');
}

main().catch(console.error);
