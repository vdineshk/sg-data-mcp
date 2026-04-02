# SG Data MCP

Real-time Singapore government data for AI agents via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io).

**Live endpoint:** `https://sg-data-mcp.sgdata.workers.dev/mcp`

## What This Does

This MCP server gives any AI agent instant access to real-time Singapore government data from [data.gov.sg](https://data.gov.sg). No API keys required. No rate limits. Free and open.

## Available Tools

| Tool | Description | Data Source |
|------|-------------|-------------|
| `sg_weather_forecast` | 2-hour weather forecast by area | NEA |
| `sg_weather_24h` | 24-hour weather outlook with temperature, humidity, wind | NEA |
| `sg_air_quality` | Real-time PSI and PM2.5 readings by region | NEA |
| `sg_carpark_availability` | Live HDB carpark lot availability across Singapore | HDB |
| `sg_taxi_availability` | Real-time count and locations of available taxis | LTA |

## Quick Start

### Connect via Streamable HTTP

```
Endpoint: https://sg-data-mcp.sgdata.workers.dev/mcp
Method: POST
Content-Type: application/json
```

### Example: List Tools

```bash
curl https://sg-data-mcp.sgdata.workers.dev/mcp \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Example: Get Weather

```bash
curl https://sg-data-mcp.sgdata.workers.dev/mcp \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","id":2,"params":{"name":"sg_weather_24h","arguments":{}}}'
```

### Use in Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sg-data": {
      "url": "https://sg-data-mcp.sgdata.workers.dev/mcp"
    }
  }
}
```

## Tech Stack

- **Runtime:** Cloudflare Workers (edge deployment, ~0ms cold start)
- **Protocol:** MCP over Streamable HTTP (JSON-RPC 2.0)
- **Data source:** data.gov.sg public APIs
- **Cost:** $0 (Cloudflare free tier)

## Roadmap

- [ ] ACRA company lookup and verification
- [ ] Bus/MRT arrival times
- [ ] Dengue cluster locations
- [ ] URA property transaction data
- [ ] MOM foreign worker levy rates
- [ ] OneMap geocoding and routing
- [ ] SGX market data

## Author

**Dinesh Kumar** — Singapore
- hello@levylens.co
- [GitHub](https://github.com/vdineshk)

## License

MIT
