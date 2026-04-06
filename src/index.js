const ACRA_ID = 'd_3f960c10fed6145404ca7b821f263b87';
let KEY = '';

async function acraSearch(q, lim = 5) {
  const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${ACRA_ID}&q=${encodeURIComponent(q)}&limit=${lim}`;
  const h = { 'User-Agent': 'SG-Data-MCP/3.0' };
  if (KEY) h['x-api-key'] = KEY;
  const r = await fetch(url, { headers: h });
  if (!(r.headers.get('content-type') || '').includes('json')) throw new Error(`HTTP ${r.status} — rate limited or unavailable`);
  const d = await r.json();
  if (d.code === 24 || r.status === 429) throw new Error('Rate limit exceeded. Try again in 30s.');
  if (d.success && d.result) return d.result;
  return { records: [], total: 0 };
}

async function acraUEN(uen) {
  const f = JSON.stringify({ uen: uen.toUpperCase() });
  const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${ACRA_ID}&filters=${encodeURIComponent(f)}&limit=1`;
  const h = { 'User-Agent': 'SG-Data-MCP/3.0' };
  if (KEY) h['x-api-key'] = KEY;
  const r = await fetch(url, { headers: h });
  if (!(r.headers.get('content-type') || '').includes('json')) throw new Error(`HTTP ${r.status}`);
  const d = await r.json();
  if (d.code === 24) throw new Error('Rate limit exceeded.');
  return d.success && d.result?.records?.[0] || null;
}

function fmtCo(r) {
  return { uen: r.uen||'N/A', name: r.entity_name||'N/A', type: r.entity_type_desc||'N/A', status: r.uen_status_desc||'N/A', agency: r.issuance_agency_desc||'N/A', issue_date: r.uen_issue_date||'N/A', street: r.reg_street_name||'N/A', postal_code: r.reg_postal_code||'N/A' };
}

async function dgov(path) {
  const r = await fetch(`https://api.data.gov.sg/v1/${path}`);
  return await r.json();
}

function txt(data) { return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }; }

export default {
  async fetch(request, env) {
    KEY = env?.DATA_GOV_API_KEY || '';
    const url = new URL(request.url);
    const C = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST,GET,OPTIONS','Access-Control-Allow-Headers':'Content-Type' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: C });

    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(JSON.stringify({
        name: 'SG Data MCP', version: '3.0.0',
        description: 'Real-time Singapore government data and ACRA company intelligence for AI agents. 13 tools covering weather, environment, transport, dengue clusters, and company verification.',
        endpoints: { streamable_http: '/mcp' }, tools_count: 13
      }), { headers: { 'Content-Type':'application/json', ...C } });
    }

    if (url.pathname === '/mcp' && request.method === 'POST') {
      const body = await request.json();
      const { method, id, params } = body;
      if (method === 'initialize') return j(id, { protocolVersion:'2024-11-05', capabilities:{tools:{}}, serverInfo:{name:'SG Data MCP',version:'3.0.0'} }, C);
      if (method === 'tools/list') return j(id, { tools: TOOLS }, C);
      if (method === 'tools/call') {
        const fn = H[params?.name];
        if (!fn) return je(id, -32602, `Unknown tool: ${params?.name}`, C);
        try { return j(id, await fn(params?.arguments||{}), C); }
        catch(e) { return je(id, -32000, e.message, C); }
      }
      if (method === 'notifications/initialized') return new Response(null, { status:204, headers:C });
      return je(id, -32601, `Method not found: ${method}`, C);
    }
    return new Response('Not found', { status:404, headers:C });
  }
};

function j(id,result,x={}) { return new Response(JSON.stringify({jsonrpc:'2.0',id,result}),{headers:{'Content-Type':'application/json',...x}}); }
function je(id,code,message,x={}) { return new Response(JSON.stringify({jsonrpc:'2.0',id,error:{code,message}}),{headers:{'Content-Type':'application/json',...x}}); }

const S = { type:'object', properties:{}, required:[] };

const TOOLS = [
  // WEATHER (4)
  { name:'sg_weather_2h', description:'Get Singapore 2-hour weather forecast by area. Use when you need current or upcoming weather for any Singapore location.', inputSchema:S },
  { name:'sg_weather_24h', description:'Get Singapore 24-hour weather outlook with temperature, humidity, and wind. Use for planning activities in Singapore.', inputSchema:S },
  { name:'sg_weather_4day', description:'Get Singapore 4-day weather forecast with daily temperature ranges and conditions. Use for multi-day planning in Singapore.', inputSchema:S },
  { name:'sg_uv_index', description:'Get Singapore real-time UV index readings. Use when you need to know sun exposure risk in Singapore for outdoor activities.', inputSchema:S },
  // ENVIRONMENT (2)
  { name:'sg_air_quality', description:'Get Singapore real-time PSI and PM2.5 air quality readings by region. Use for haze conditions and health advisories.', inputSchema:S },
  { name:'sg_dengue_clusters', description:'Get active dengue cluster locations in Singapore with case counts and GeoJSON boundaries. Use for health risk assessment, property evaluation, or travel safety in Singapore.', inputSchema:S },
  // TRANSPORT (3)
  { name:'sg_carpark_availability', description:'Get real-time HDB carpark lot availability across Singapore. Use to find available parking.', inputSchema:S },
  { name:'sg_taxi_availability', description:'Get real-time count and locations of available taxis in Singapore.', inputSchema:S },
  { name:'sg_rainfall', description:'Get real-time rainfall readings from 50+ weather stations across Singapore. Use to check if it is currently raining in specific areas.', inputSchema:S },
  // ACRA COMPANY (3)
  { name:'sg_company_search', description:'Search Singapore registered companies by name using ACRA data. Returns UEN, entity type, status, and address. Use for KYB verification, due diligence, or finding any Singapore business entity.', inputSchema:{ type:'object', properties:{ query:{type:'string',description:'Company name or partial name (e.g. "Grab", "DBS")'}, limit:{type:'number',description:'Max results (default 5, max 20)'} }, required:['query'] } },
  { name:'sg_company_uen', description:'Look up a Singapore company by UEN (Unique Entity Number). Returns full ACRA registration details. Use when you have a UEN to verify.', inputSchema:{ type:'object', properties:{ uen:{type:'string',description:'Unique Entity Number (e.g. "200601141R")'} }, required:['uen'] } },
  { name:'sg_company_verify', description:'Verify if a Singapore company exists and is currently registered/active. Use for quick KYB checks, fraud prevention, or compliance.', inputSchema:{ type:'object', properties:{ company_name:{type:'string',description:'Company name to verify'} }, required:['company_name'] } },
  // STATISTICS (1)
  { name:'sg_registered_entities_count', description:'Get total count of all entities registered with ACRA in Singapore by type (companies, sole proprietorships, partnerships, etc.). Use for market sizing or understanding the Singapore business landscape.', inputSchema:S },
];

const H = {
  sg_weather_2h: async () => txt(await dgov('environment/2-hour-weather-forecast')),
  sg_weather_24h: async () => txt(await dgov('environment/24-hour-weather-forecast')),
  sg_weather_4day: async () => txt(await dgov('environment/4-day-weather-forecast')),
  sg_uv_index: async () => txt(await dgov('environment/uv-index')),
  sg_air_quality: async () => {
    const [p,m] = await Promise.all([dgov('environment/psi'), dgov('environment/pm25')]);
    return txt({ psi:p, pm25:m });
  },
  sg_dengue_clusters: async () => {
    const r = await fetch('https://data.gov.sg/api/action/datastore_search?resource_id=d_dbfabf16158d1b0e1c420627c0819168&limit=100');
    const ct = r.headers.get('content-type')||'';
    if (ct.includes('json')) {
      const d = await r.json();
      // If it's a GeoJSON dataset, try direct download
      if (d.code === 24) throw new Error('Rate limited. Try again in 30s.');
      if (d.success) return txt(d.result);
    }
    // Fallback: fetch GeoJSON directly
    const r2 = await fetch('https://data.gov.sg/datasets/d_dbfabf16158d1b0e1c420627c0819168/view');
    return txt({ note: 'Dengue cluster data available at https://data.gov.sg/datasets/d_dbfabf16158d1b0e1c420627c0819168/view', status: 'Use sg_dengue_clusters_geo for GeoJSON data' });
  },
  sg_carpark_availability: async () => txt(await dgov('transport/carpark-availability')),
  sg_taxi_availability: async () => {
    const d = await dgov('transport/taxi-availability');
    return txt({ available_taxis: d?.features?.length||0, timestamp: d?.properties?.timestamp });
  },
  sg_rainfall: async () => {
    const d = await dgov('environment/rainfall');
    const stations = d?.items?.[0]?.readings || [];
    const raining = stations.filter(s => s.value > 0);
    return txt({
      timestamp: d?.items?.[0]?.timestamp,
      total_stations: stations.length,
      stations_with_rain: raining.length,
      raining_areas: raining.map(s => {
        const meta = d?.metadata?.stations?.find(m => m.id === s.station_id);
        return { station: meta?.name || s.station_id, rainfall_mm: s.value, location: meta?.location };
      }),
      dry_station_count: stations.length - raining.length
    });
  },
  sg_company_search: async (a) => {
    if (!a.query || a.query.length < 2) return txt({ error: 'Query must be 2+ characters' });
    const r = await acraSearch(a.query, Math.min(a.limit||5, 20));
    const recs = r.records||[];
    if (!recs.length) return txt({ query:a.query, total:0, message:'No companies found.' });
    return txt({ query:a.query, total:r.total, shown:recs.length, companies:recs.map(fmtCo) });
  },
  sg_company_uen: async (a) => {
    if (!a.uen || a.uen.length < 5) return txt({ error: 'Provide valid UEN (5+ chars)' });
    const rec = await acraUEN(a.uen);
    if (!rec) return txt({ uen:a.uen, found:false });
    return txt({ found:true, company:fmtCo(rec) });
  },
  sg_company_verify: async (a) => {
    if (!a.company_name || a.company_name.length < 2) return txt({ error: 'Name must be 2+ chars' });
    const r = await acraSearch(a.company_name, 5);
    const recs = r.records||[];
    if (!recs.length) return txt({ verified:false, company_name:a.company_name, message:'Not found in ACRA records.' });
    const m = recs.map(r => ({ name:r.entity_name||'N/A', uen:r.uen||'N/A', status:r.uen_status_desc||'N/A', is_active:(r.uen_status_desc||'').toUpperCase().includes('REGISTERED'), type:r.entity_type_desc||'N/A' }));
    return txt({ verified:true, has_active:m.some(x=>x.is_active), matches:m });
  },
  sg_registered_entities_count: async () => {
    const h = { 'User-Agent':'SG-Data-MCP/3.0' };
    if (KEY) h['x-api-key'] = KEY;
    const r = await fetch(`https://data.gov.sg/api/action/datastore_search?resource_id=${ACRA_ID}&limit=0`, { headers: h });
    const d = await r.json();
    if (d.success) return txt({ total_registered_entities: d.result.total, source: 'ACRA via data.gov.sg', note: 'Includes all companies, sole proprietorships, partnerships, LLPs registered in Singapore' });
    return txt({ error: 'Could not retrieve count', raw: d });
  },
};
