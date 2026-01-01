import fetch from 'node-fetch';

const ORCHESTRATOR = process.env.ORCHESTRATOR_URL || 'https://orchestrator-896380409704.us-east1.run.app';
const TOKEN = process.env.FRONTEND_TEST_TOKEN || 'tPLxWY7e8/x3waKMoZQ2vlW1dZG0ERsDiNMHADr8xgE=';

function log(label, ok, details=''){
  console.log(`${ok ? '✓' : '✗'} ${label}${details ? ' - ' + details : ''}`);
}

async function checkHealth(){
  const res = await fetch(`${ORCHESTRATOR}/health`, { method: 'GET' });
  const ok = res.status === 200;
  const body = await res.text();
  log('GET /health', ok, `${res.status} ${body.slice(0,200)}`);
  return ok;
}

async function checkPreflight(){
  const res = await fetch(`${ORCHESTRATOR}/v1/chat`, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://preview-xyz.hostingerapp.com',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type,Authorization'
    }
  });
  const allow = res.headers.get('access-control-allow-origin');
  const ok = res.status === 204 || (allow && allow !== '');
  log('CORS preflight /v1/chat', ok, `${res.status} origin:${allow}`);
  return ok;
}

async function checkChat(){
  const res = await fetch(`${ORCHESTRATOR}/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ messages:[{ role:'user', content:'sync test ping' }] })
  });
  const ok = res.status === 200;
  const text = await res.text();
  log('POST /v1/chat', ok, `${res.status} ${text.slice(0,400)}`);
  return ok;
}

async function checkHostingerPing(){
  const res = await fetch(`${ORCHESTRATOR}/hostinger/ping`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  const ok = res.status === 200;
  const json = await res.text();
  log('GET /hostinger/ping', ok, `${res.status} ${json.slice(0,200)}`);
  return ok;
}

async function run(){
  console.log('ORCHESTRATOR_URL=', ORCHESTRATOR);
  const results = await Promise.all([checkHealth(), checkPreflight(), checkChat(), checkHostingerPing()]);
  const passed = results.every(r => r);
  if (!passed) process.exitCode = 2;
  console.log(passed ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED');
}

run();
