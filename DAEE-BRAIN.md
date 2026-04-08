# DAEE — Brain
Updated: 2026-04-08

## EMPIRE STATUS
SG tools: 13 | Target: 25 by Month 2, 40 by Month 4
ASEAN tools: 0 | Target: 10 by Month 4
Directories: 3 (Smithery, mcp.so, Glama) | Target: 8 by Month 2
Revenue: $0 | Target: first $ by Month 3
Competitors: 4 FOUND (see PATTERNS) — MONOPOLY ASSUMPTION INVALIDATED
Monetization: INACTIVE

## WHAT WORKS
- Cloudflare Workers edge deployment = zero cold start, global reach (differentiator vs local-only competitors)
- Broadest category coverage in one server (weather + env + transport + company) — no competitor covers all 4
- Remote MCP via Streamable HTTP — most competitors require local install
- Glama auto-indexed us (free listing, no effort required)

## WHAT FAILED
[First run — nothing failed yet]

## PATTERNS

### Competitive Landscape (as of 2026-04-08) — CRITICAL

**4 Singapore MCP competitors identified:**

1. **sgpdirectory.com + @sgpdirectory/mcp** — THREAT: HIGH
   - 2M+ entities database (vs our ACRA dataset subset)
   - Professional API with free tier + paid tiers (API key system, console)
   - SSIC industry classification codes (we don't have this)
   - Tracks cancellations/terminations daily
   - Listed on: mcp.so
   - RESPONSE NEEDED: Add SSIC codes to our company tools, add more company data depth

2. **arjunkmrm/mcp-sg-lta** — THREAT: MEDIUM
   - LTA DataMall API integration (bus arrivals, train alerts, station crowding, traffic incidents)
   - Deep transport-specific coverage we lack
   - Listed on: Smithery, Glama
   - RESPONSE NEEDED: Add LTA DataMall tools (bus arrival, MRT alerts, traffic)

3. **Apify sg-open-data-mcp** — THREAT: MEDIUM
   - Similar feature set (weather, carpark, taxi, PSI)
   - Locked to Apify platform ecosystem
   - Generic data.gov.sg dataset querying
   - RESPONSE NEEDED: Add generic dataset query tool to match

4. **prezgamer/Singapore-Data-MCPs** — THREAT: LOW
   - 21 tools (6 carpark + 15 graduate employment survey)
   - Python, local-only, low activity (1 star)
   - RESPONSE NEEDED: Add GES (graduate employment survey) data

### Directory Landscape (as of 2026-04-08)

**Known directories (20+):**
- [x] Smithery (smithery.ai) — LISTED
- [x] mcp.so — LISTED
- [x] Glama (glama.ai) — LISTED (auto-indexed)
- [ ] Official MCP Registry (registry.modelcontextprotocol.io) — needs npm package + mcp-publisher CLI
- [ ] PulseMCP (pulsemcp.com) — 11,140+ servers, submit via site or hello@pulsemcp.com
- [ ] awesome-mcp-servers (wong2) — submit at mcpservers.org/submit
- [ ] mcp.directory — submit button on site (3,000+ servers)
- [ ] mcpserve.com/submit — submit via site or GitHub PR
- [ ] LobeHub (lobehub.com/mcp) — needs npm/GitHub
- [ ] mcpserverfinder.com — submit
- [ ] mcp-server-directory.com — submit
- [ ] mcpserverdirectory.org — submit
- [ ] hubmcp.dev — submit
- [ ] mcphub.dev — submit
- [ ] mcpserverhub.net — submit (free)
- [ ] playbooks.com/mcp — submit
- [ ] popularaitools.ai — submit
- [ ] MACH Alliance MCP Registry (machalliance.org) — vendor-neutral
- [ ] getmcpapps.com — MCPHub marketplace
- [ ] augmentcode.com/mcp — submit
- [ ] mcpserver.cc — directory collection meta-site
- [ ] SkillsIndex (skillsindex.dev) — submit for scoring
- [ ] FastMCP (fastmcp.me) — submit
- [ ] best-of-mcp-servers (tolkonepiu) — GitHub submit
- [ ] npm package publication — for discoverability

### Ecosystem Insights
- 12,000+ MCP servers in ecosystem (March 2026)
- Official MCP Registry launched Sept 2025, still in preview
- Registry uses npm for artifact storage + mcp-publisher CLI for metadata
- Namespace verification: GitHub OAuth or DNS TXT records
- PulseMCP has weekly newsletter — getting featured = massive discovery

## STRATEGY
Current phase: EMERGENCY RESPONSE — competitors exist, must accelerate listing + tool additions
Monopoly assumption: INVALIDATED — 4 competitors found, but NONE covers all categories in one remote server

**Revised strategy:**
1. IMMEDIATE: List on 5+ more directories this week (distribution gap is our biggest weakness)
2. THIS WEEK: Add LTA DataMall tools to counter arjunkmrm's transport advantage
3. THIS WEEK: Add SSIC codes to counter sgpdirectory's company data advantage
4. Keep building breadth — our advantage is "one server for everything SG"
5. The remote-first edge deployment is a real differentiator — emphasize this in all listings

Monetization trigger: 25+ tools AND 8+ directories AND organic usage evidence
When triggered: use MCPize (85/15 split) or PayGate (one command, keep 100%)
Pricing strategy: $29 starter / $99 pro / $299 enterprise (review when competitors appear)

## ROTATION OVERRIDE
ACTIVE — Due to competitor discovery:
- Next Tuesday: PRIORITY BUILD — LTA DataMall tools (bus arrival, MRT alerts, traffic incidents)
- Next Thursday: BUILD DAY #2 — SSIC codes + GES data tools
- Accelerate directory listings — treat as HIGH urgency every Wednesday

## DINESH TASKS
[2026-04-08] [HIGH] [15min] — Submit to 5 MCP directories (exact steps below)

### Directory Submission Tasks (do in order, ~3min each):

**1. mcpservers.org (awesome-mcp-servers by wong2)**
- Go to: https://mcpservers.org/submit
- Fill form with:
  - Name: SG Data MCP
  - URL: https://github.com/vdineshk/sg-data-mcp
  - Description: "Real-time Singapore government data (weather, transport, air quality, company registry) for AI agents. 13 tools, remote Cloudflare Workers deployment, zero cold start."
  - Category: Data & Information

**2. PulseMCP**
- Go to: https://www.pulsemcp.com (look for Submit/Add Server button)
- OR email: hello@pulsemcp.com with:
  - Subject: "Submit MCP Server: SG Data MCP — Singapore Government Data"
  - Body: Server URL, GitHub URL, description, 13 tools list
- Also pitch for weekly newsletter feature

**3. mcp.directory**
- Go to: https://mcp.directory
- Click "Submit Server" button
- Fill with: name, GitHub URL, endpoint URL, description

**4. mcpserverhub.net**
- Go to: https://mcpserverhub.net
- Click submit/add
- Fill form with server details

**5. mcp-server-directory.com**
- Go to: https://www.mcp-server-directory.com
- Submit server listing

[2026-04-08] [HIGH] [10min] — Publish npm package (required for official MCP registry)
- Commands (run on dev PC):
```
cd C:\Users\vdine\sg-data-mcp
npm login
# Edit package.json: set "name" to "@vdineshk/sg-data-mcp" or "sg-data-mcp"
# Ensure "main", "description", "keywords" are set
npm publish --access public
```

[2026-04-08] [MED] [5min] — After npm published, register on official MCP registry:
```
# Install mcp-publisher CLI (check latest install method at github.com/modelcontextprotocol/registry)
curl -fsSL https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher-linux-amd64 -o mcp-publisher
chmod +x mcp-publisher
./mcp-publisher init
# Edit server.json with correct details
./mcp-publisher login github
./mcp-publisher publish
```

[2026-04-08] [MED] [5min] — Claim Glama profile
- Go to: https://glama.ai/mcp/servers/vdineshk/sg-data-mcp
- Look for "Claim" button to verify ownership
- Claimed profiles rank higher in search

## RUN LOG (keep last 14 entries only)
[2026-04-08] WED | DISTRIBUTION | PRODUCED
Result: Found 4 SG MCP competitors (sgpdirectory HIGH, arjunkmrm MED, Apify MED, prezgamer LOW). Discovered 20+ MCP directories (we're only on 3). Created submission plan for 5 directories + npm + official registry.
Dinesh task: YES — submit to 5 directories (15min) + npm publish (10min) + official registry (5min) + claim Glama (5min)
Adaptation: Created Brain. Updated STRATEGY from LAND GRAB to EMERGENCY RESPONSE. Set ROTATION OVERRIDE to prioritize LTA DataMall + SSIC tools next build days.
