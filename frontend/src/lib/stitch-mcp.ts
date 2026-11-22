/**
 * Server-side Streamable HTTP MCP Client for Google Stitch
 * Connects to https://stitch.googleapis.com/mcp via JSON-RPC 2.0
 */

const STITCH_MCP_URL =
  process.env.STITCH_MCP_URL || "https://stitch.googleapis.com/mcp";
const STITCH_API_KEY = process.env.STITCH_API_KEY || "";
const STITCH_PROJECT_ID =
  process.env.STITCH_PROJECT_ID || "15911499845806615603";

export interface StitchScreenSummary {
  id: string;
  label: string;
  width: number;
  height: number;
  device: "DESKTOP" | "MOBILE";
}

export interface StitchSyncPayload {
  connected: boolean;
  endpoint: string;
  protocolVersion: string;
  projectId: string;
  projectTitle: string;
  designSystemName: string;
  fonts: {
    headline: string;
    body: string;
    label: string;
  };
  primaryColor: string;
  screens: StitchScreenSummary[];
  toolsCount: number;
  latencyMs: number;
  syncedAt: string;
  error?: string;
}

async function mcpRpc<T = unknown>(
  method: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  if (!STITCH_API_KEY) {
    throw new Error("Missing STITCH_API_KEY environment variable");
  }

  const res = await fetch(STITCH_MCP_URL, {
    method: "POST",
    headers: {
      "X-Goog-Api-Key": STITCH_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Stitch MCP HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    result?: T;
    error?: { code: number; message: string };
  };

  if (json.error) {
    throw new Error(`Stitch MCP RPC Error: ${json.error.message}`);
  }

  return json.result as T;
}

function parseToolContent<T = Record<string, unknown>>(result: unknown): T {
  const r = result as { content?: Array<{ text?: string }> };
  const txt = r?.content?.[0]?.text;
  if (!txt) return {} as T;
  try {
    return JSON.parse(txt) as T;
  } catch {
    return {} as T;
  }
}

export async function fetchStitchSyncStatus(): Promise<StitchSyncPayload> {
  const started = Date.now();
  try {
    const [initRes, toolsRes, projectToolRes, dsToolRes] = await Promise.all([
      mcpRpc<{ protocolVersion?: string }>("initialize", {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "eventhub-nextjs", version: "1.0.0" },
      }),
      mcpRpc<{ tools?: Array<{ name: string }> }>("tools/list", {}),
      mcpRpc("tools/call", {
        name: "get_project",
        arguments: { name: `projects/${STITCH_PROJECT_ID}` },
      }),
      mcpRpc("tools/call", {
        name: "list_design_systems",
        arguments: { projectId: STITCH_PROJECT_ID },
      }),
    ]);

    const project = parseToolContent<{
      title?: string;
      designTheme?: {
        headlineFontFamily?: string;
        bodyFontFamily?: string;
        labelFontFamily?: string;
        customColor?: string;
      };
      screenInstances?: Array<{
        id: string;
        label?: string;
        width?: number;
        height?: number;
        sourceScreen?: string;
      }>;
    }>(projectToolRes);

    const ds = parseToolContent<{
      designSystems?: Array<{ designSystem?: { displayName?: string } }>;
    }>(dsToolRes);

    const screens: StitchScreenSummary[] = (project.screenInstances || [])
      .filter((s) => Boolean(s.sourceScreen))
      .map((s) => ({
        id: s.id,
        label: s.label || s.id,
        width: s.width || 1280,
        height: s.height || 800,
        device: (s.width || 1280) <= 500 ? "MOBILE" : "DESKTOP",
      }));

    return {
      connected: true,
      endpoint: STITCH_MCP_URL,
      protocolVersion: initRes?.protocolVersion || "2025-03-26",
      projectId: STITCH_PROJECT_ID,
      projectTitle: project.title || "EventHub Campus Platform",
      designSystemName:
        ds.designSystems?.[0]?.designSystem?.displayName || "Kinetic Campus",
      fonts: {
        headline: project.designTheme?.headlineFontFamily || "Plus Jakarta Sans",
        body: project.designTheme?.bodyFontFamily || "Inter",
        label: project.designTheme?.labelFontFamily || "JetBrains Mono",
      },
      primaryColor: project.designTheme?.customColor || "#ff5a5f",
      screens,
      toolsCount: toolsRes?.tools?.length || 18,
      latencyMs: Date.now() - started,
      syncedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      connected: false,
      endpoint: STITCH_MCP_URL,
      protocolVersion: "2025-03-26",
      projectId: STITCH_PROJECT_ID,
      projectTitle: "EventHub Campus Platform",
      designSystemName: "Kinetic Campus",
      fonts: {
        headline: "Plus Jakarta Sans",
        body: "Inter",
        label: "JetBrains Mono",
      },
      primaryColor: "#ff5a5f",
      screens: [],
      toolsCount: 0,
      latencyMs: Date.now() - started,
      syncedAt: new Date().toISOString(),
      error: err instanceof Error ? err.message : "Unable to reach Stitch MCP",
    };
  }
}
