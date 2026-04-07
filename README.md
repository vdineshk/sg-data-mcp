# SG Data MCP

Real-time Singapore government data and ACRA company intelligence for AI agents via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io).

**Live endpoint:** `https://sg-data-mcp.sgdata.workers.dev/mcp`

## What This Does

This MCP server gives any AI agent instant access to 13 real-time tools covering Singapore government data from [data.gov.sg](https://data.gov.sg) and ACRA company records. No API keys required for free tier.

## Available Tools

### Weather & Environment
| Tool | Description | Source |
|------|-------------|--------|
| `sg_weather_2h` | 2-hour forecast by area | NEA |
| `sg_weather_24h` | 24-hour outlook with temp/humidity/wind | NEA |
| `sg_weather_4day` | 4-day forecast with daily conditions | NEA |
| `sg_uv_index` | Real-time UV exposure readings | NEA |
| `sg_air_quality` | PSI and PM2.5 by region | NEA |
| `sg_rainfall` | Live rainfall from 50+ stations | NEA |
| `sg_dengue_clusters` | Active dengue cluster locations and case counts | NEA |

### Transport
| Tool | Description | Source |
|------|-------------|--------|
| `sg_carpark_availability` | Live HDB carpark lot availability | HDB |
| `sg_taxi_availability` | Real-time taxi count and locations | LTA |

### ACRA Company Intelligence
| Tool | Description | Source |
|------|-------------|--------|
| `sg_company_search` | Search companies by name — returns UEN, type, status, address | ACRA |
| `sg_company_uen` | Look up company by UEN number | ACRA |
| `sg_company_verify` | Verify if a company exists and is active | ACRA |
| `sg_registered_entities_count` | Total count of all ACRA-registered entities | ACRA |

## Quick Start

### Connect via Streamable HTTP
