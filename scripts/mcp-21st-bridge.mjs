#!/usr/bin/env node
import readline from 'node:readline';

const ENDPOINT = process.env['TWENTY_FIRST_MCP_URL'] || 'https://21st.dev/api/mcp';
const API_KEY = process.env['TWENTY_FIRST_API_KEY'] || '21st_sk_a302baeadd5dade7f462ef5827882195dfe9aece7c9d051fca7383077833db0c';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const payload = JSON.parse(trimmed);
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    process.stdout.write(JSON.stringify(json) + '\n');
  } catch (err) {
    const errorResponse = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: err instanceof Error ? err.message : String(err)
      }
    };
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
  }
});
