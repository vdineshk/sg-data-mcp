const ACRA_DATASET_ID = 'd_3f960c10fed6145404ca7b821f263b87';
let API_KEY = '';

async function searchACRA(query, limit = 5) {
  const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${ACRA_DATASET_ID}&q=${encodeURIComponent(query)}&limit=${limit}`;
  const headers = { 'User-Agent': 'SG-Data-MCP/2.0' };
  if (API_KEY) headers['x-api-key'] = API_KEY;
  const res = await fetch(url, { headers });
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('json')) {
    throw new Error(`API returned non-JSON (HTTP ${res.status}). Rate-limited or unavailable.`);
  }
  const data = await res.json();
  if (data.code === 24 || res.status === 429) {
    throw new Error('data.gov.sg rate limit exceeded. Try again in 30 seconds.');
  }
  if (data.success && data.result) return data.result;
  if (data.code && data.code !== 0) throw new Error(`API error: ${data.errorMsg || data.name}`);
  return { records: [], total: 0 };
}

async function lookupByUEN(uen) {
  const filters = JSON.stringify({ uen: uen.toUpperCase() });
  const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${ACRA_DATASET_ID}&filters=${encodeURIComponent(filters)}&limit=1`;
  const headers = { 'User-Agent': 'SG-Data-MCP/2.0' };
  if (API_KEY) headers['x-api-key'] = API_KEY;
  const res = await fetch(url, { headers });
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('json')) throw new Error(`API returned non-JSON (HTTP ${res.status}).`);
  const data = await res.json();
  if (data.code === 24 || res.status === 429) throw new Error('Rate limit exceeded. Try again in 30 seconds.');
  if (data.success && data.result?.records?.length > 0) return data.result.records[0];
  return null;
}

function fmt(r) {
  return {
    uen: r.uen || 'N/A',
    name: r.entity_name || 'N/A',
    type: r.entity_type_desc || 'N/A',
    status: r.uen_status_desc || 'N/A',
    agency: r.issuance_agency_desc || 'N/A',
    issue_date: r.uen_issue_date || 'N/A',
    street: r.reg_street_name || 'N/A',
    postal_code: r.reg_postal_code || 'N/A',
  };
}

export default {
  async fetch(request, env, ctx) {
    API_KEY = env?.DATA_GOV_API_KEY || '';
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(JSON.stringify({
        name: 'SG Data MCP', version: '2.0.0',
        description: 'Real-time Singapore government data and ACRA company intelligence for AI agents.',
        endpoints: { streamable_http: '/mcp' }, tools_count: 8
      }), { headers: { 'Content-Type': 'application/json', ...cors } });
    }

    if (url.pathname === '/mcp' && request.method === 'POST') {
      const body = await request.json();
      const { method, id, params } = body;

      if (method === 'initialize') return jrpc(id, {
        protocolVersion: '2024-11-05', capabilities: { tools: {} },
        serverInfo: { name: 'SG Data MCP', version: '2.0.0' }
      }, cors);

      if (method === 'tools/list') return jrpc(id, { tools: TOOLS }, cors);

      if (method === 'tools/call') {
        const h = HANDLERS[params?.name];
        if (!h) return jerr(id, -32602, `Unknown tool: ${params?.name}`, cors);
        try { return jrpc(id, await h(params?.arguments || {}), cors); }
        catch (e) { return jerr(id, -32000, e.message, cors); }
      }

      if (method === 'notifications/initialized') return new Response(null, { status: 204, headers: cors });
      return jerr(id, -32601, `Method not found: ${method}`, cors);
    }
    return new Response('Not found', { status: 404, headers: cors });
  }
};

function jrpc(id, result, x = {}) {
  return new Response(JSON.stringify({ jsonrpc: '2.0', id, result }), { headers: { 'Content-Type': 'application/json', ...x } });
}
function jerr(id, code, message, x = {}) {
  return new Response(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }), { headers: { 'Content-Type': 'application/json', ...x } });
}

const TOOLS = [
  { name: 'sg_weather_forecast', description: 'Get Singapore 2-hour weather forecast by area. Use this when you need current or upcoming weather conditions for any location in Singapore.', inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'sg_weather_24h', description: 'Get Singapore 24-hour weather outlook including temperature ranges, humidity, and wind conditions. Use this for planning activities in Singapore over the next day.', inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'sg_air_quality', description: 'Get Singapore real-time PSI (Pollutant Standards Index) and PM2.5 readings by region. Use this when you need current air quality data for Singapore including haze conditions.', inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'sg_carpark_availability', description: 'Get real-time carpark availability across all HDB carparks in Singapore. Use this when you need to find available parking lots in Singapore.', inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'sg_taxi_availability', description: 'Get real-time count of all available taxis in Singapore. Use this when you need to know taxi supply across Singapore.', inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'sg_company_search', description: 'Search for Singapore registered companies and business entities by name using ACRA data from data.gov.sg. Returns UEN, entity type, registration status, and address. Use this for KYB (Know Your Business) verification, due diligence, or finding any Singapore-registered company.', inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'Company name or partial name (e.g. "Grab", "DBS", "Shopee")' }, limit: { type: 'number', description: 'Max results (default 5, max 20)' } }, required: ['query'] } },
  { name: 'sg_company_lookup_uen', description: 'Look up a Singapore company by its UEN (Unique Entity Number). Returns registration details from ACRA. Use when you have a UEN and need to verify company details.', inputSchema: { type: 'object', properties: { uen: { type: 'string', description: 'Unique Entity Number (e.g. "200601141R")' } }, required: ['uen'] } },
  { name: 'sg_company_verify', description: 'Verify if a Singapore company exists and is currently active/registered. Use for quick KYB verification, fraud prevention, or compliance checks.', inputSchema: { type: 'object', properties: { company_name: { type: 'string', description: 'Company name to verify' } }, required: ['company_name'] } },
];

const HANDLERS = {
  sg_weather_forecast: async () => {
    const r = await fetch('https://api.data.gov.sg/v1/environment/2-hour-weather-forecast'); const d = await r.json();
    return { content: [{ type: 'text', text: JSON.stringify(d, null, 2) }] };
  },
  sg_weather_24h: async () => {
    const r = await fetch('https://api.data.gov.sg/v1/environment/24-hour-weather-forecast'); const d = await r.json();
    return { content: [{ type: 'text', text: JSON.stringify(d, null, 2) }] };
  },
  sg_air_quality: async () => {
    const [p, m] = await Promise.all([
      fetch('https://api.data.gov.sg/v1/environment/psi').then(r => r.json()),
      fetch('https://api.data.gov.sg/v1/environment/pm25').then(r => r.json()),
    ]);
    return { content: [{ type: 'text', text: JSON.stringify({ psi: p, pm25: m }, null, 2) }] };
  },
  sg_carpark_availability: async () => {
    const r = await fetch('https://api.data.gov.sg/v1/transport/carpark-availability'); const d = await r.json();
    return { content: [{ type: 'text', text: JSON.stringify(d, null, 2) }] };
  },
  sg_taxi_availability: async () => {
    const r = await fetch('https://api.data.gov.sg/v1/transport/taxi-availability'); const d = await r.json();
    const c = d?.features?.length || 0;
    return { content: [{ type: 'text', text: JSON.stringify({ available_taxis: c, timestamp: d?.properties?.timestamp }, null, 2) }] };
  },
  sg_company_search: async (args) => {
    const q = args.query; const lim = Math.min(args.limit || 5, 20);
    if (!q || q.length < 2) return { content: [{ type: 'text', text: 'Error: Query must be at least 2 characters.' }] };
    const result = await searchACRA(q, lim);
    const recs = result.records || [];
    if (recs.length === 0) return { content: [{ type: 'text', text: JSON.stringify({ query: q, total: 0, message: `No companies found matching "${q}".` }, null, 2) }] };
    return { content: [{ type: 'text', text: JSON.stringify({ query: q, total: result.total, shown: recs.length, companies: recs.map(fmt) }, null, 2) }] };
  },
  sg_company_lookup_uen: async (args) => {
    const u = args.uen;
    if (!u || u.length < 5) return { content: [{ type: 'text', text: 'Error: Provide a valid UEN (5+ chars).' }] };
    const rec = await lookupByUEN(u);
    if (!rec) return { content: [{ type: 'text', text: JSON.stringify({ uen: u, found: false }, null, 2) }] };
    return { content: [{ type: 'text', text: JSON.stringify({ found: true, company: fmt(rec) }, null, 2) }] };
  },
  sg_company_verify: async (args) => {
    const n = args.company_name;
    if (!n || n.length < 2) return { content: [{ type: 'text', text: 'Error: Name must be at least 2 characters.' }] };
    const result = await searchACRA(n, 5);
    const recs = result.records || [];
    if (recs.length === 0) return { content: [{ type: 'text', text: JSON.stringify({ verified: false, company_name: n, message: 'Not found in ACRA records.' }, null, 2) }] };
    const matches = recs.map(r => ({
      name: r.entity_name || 'N/A', uen: r.uen || 'N/A', status: r.uen_status_desc || 'N/A',
      is_active: (r.uen_status_desc || '').toUpperCase().includes('REGISTERED'), type: r.entity_type_desc || 'N/A',
    }));
    return { content: [{ type: 'text', text: JSON.stringify({ verified: true, has_active: matches.some(m => m.is_active), matches }, null, 2) }] };
  },
};
