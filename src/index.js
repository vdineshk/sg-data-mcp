export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Root: server info
    if (url.pathname === "/" && request.method === "GET") {
      return new Response(JSON.stringify({
        name: "SG Data MCP",
        version: "1.0.0",
        description: "Real-time Singapore government data for AI agents. Weather, air quality, transport, and carpark availability.",
        endpoints: { streamable_http: "/mcp" }
      }), { headers: { "Content-Type": "application/json" } });
    }

    // MCP endpoint
    if (url.pathname === "/mcp" && request.method === "POST") {
      const body = await request.json();
      const { method, id, params } = body;

      // Initialize
      if (method === "initialize") {
        return jsonrpc(id, {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "SG Data MCP", version: "1.0.0" }
        });
      }

      // List tools
      if (method === "tools/list") {
        return jsonrpc(id, { tools: TOOLS });
      }

      // Call tool
      if (method === "tools/call") {
        const toolName = params?.name;
        const handler = TOOL_HANDLERS[toolName];
        if (!handler) {
          return jsonrpcError(id, -32602, `Unknown tool: ${toolName}`);
        }
        try {
          const result = await handler(params?.arguments || {});
          return jsonrpc(id, result);
        } catch (e) {
          return jsonrpcError(id, -32000, `Tool error: ${e.message}`);
        }
      }

      // Notifications (no response needed)
      if (method === "notifications/initialized") {
        return new Response(null, { status: 204 });
      }

      return jsonrpcError(id, -32601, `Method not found: ${method}`);
    }

    return new Response("Not found", { status: 404 });
  }
};

function jsonrpc(id, result) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    headers: { "Content-Type": "application/json" }
  });
}

function jsonrpcError(id, code, message) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }), {
    headers: { "Content-Type": "application/json" }
  });
}

const TOOLS = [
  {
    name: "sg_weather_forecast",
    description: "Get Singapore 2-hour weather forecast by area. Use this when you need current or upcoming weather conditions for any location in Singapore.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "sg_weather_24h",
    description: "Get Singapore 24-hour weather outlook including temperature ranges, humidity, and wind conditions. Use this for planning activities in Singapore over the next day.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "sg_air_quality",
    description: "Get Singapore real-time PSI (Pollutant Standards Index) and PM2.5 readings by region. Use this when you need current air quality data for Singapore including haze conditions.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "sg_carpark_availability",
    description: "Get real-time carpark availability across all HDB carparks in Singapore. Use this when you need to find available parking lots in Singapore.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "sg_taxi_availability",
    description: "Get real-time locations and count of all available taxis in Singapore. Use this when you need to know taxi supply and availability across Singapore.",
    inputSchema: { type: "object", properties: {}, required: [] }
  }
];

const TOOL_HANDLERS = {
  sg_weather_forecast: async () => {
    const res = await fetch("https://api.data.gov.sg/v1/environment/2-hour-weather-forecast");
    const data = await res.json();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },

  sg_weather_24h: async () => {
    const res = await fetch("https://api.data.gov.sg/v1/environment/24-hour-weather-forecast");
    const data = await res.json();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },

  sg_air_quality: async () => {
    const [psi, pm25] = await Promise.all([
      fetch("https://api.data.gov.sg/v1/environment/psi").then(r => r.json()),
      fetch("https://api.data.gov.sg/v1/environment/pm25").then(r => r.json()),
    ]);
    return { content: [{ type: "text", text: JSON.stringify({ psi, pm25 }, null, 2) }] };
  },

  sg_carpark_availability: async () => {
    const res = await fetch("https://api.data.gov.sg/v1/transport/carpark-availability");
    const data = await res.json();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },

  sg_taxi_availability: async () => {
    const res = await fetch("https://api.data.gov.sg/v1/transport/taxi-availability");
    const data = await res.json();
    const count = data?.features?.length || 0;
    return { content: [{ type: "text", text: JSON.stringify({ available_taxis: count, timestamp: data?.properties?.timestamp }, null, 2) }] };
  }
};
