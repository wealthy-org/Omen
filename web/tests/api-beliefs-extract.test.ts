import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../app/api/beliefs/extract/route";
import { extractBeliefFromText } from "../lib/ai/openrouter";
import fs from "node:fs";
import path from "node:path";

describe("TICKET-84: POST /api/beliefs/extract", () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.OPENROUTER_API_KEY;
  const originalModel = process.env.OPENROUTER_MODEL;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.OPENROUTER_API_KEY = "test-openrouter-key";
    process.env.OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct:free";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.OPENROUTER_API_KEY = originalApiKey;
    process.env.OPENROUTER_MODEL = originalModel;
  });

  it("should adhere strictly to Zero-Comment Policy in route, lib, and type files", () => {
    const filesToCheck = [
      path.resolve(process.cwd(), "app/api/beliefs/extract/route.ts"),
      path.resolve(process.cwd(), "lib/ai/openrouter.ts"),
      path.resolve(process.cwd(), "lib/ai/mockOpenRouter.ts"),
      path.resolve(process.cwd(), "types/belief.ts"),
    ];

    for (const filePath of filesToCheck) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          expect(trimmed.startsWith("/" + "/")).toBe(false);
          expect(trimmed.startsWith("/" + "*")).toBe(false);
          expect(trimmed.includes("*" + "/")).toBe(false);
        }
      }
    }
  });

  it("should throw an explicit error when OPENROUTER_API_KEY is not configured", async () => {
    delete process.env.OPENROUTER_API_KEY;

    await expect(extractBeliefFromText("ETH to 5000")).rejects.toThrow(
      "OPENROUTER_API_KEY is not configured."
    );
  });

  it("should throw an explicit error when OPENROUTER_MODEL is not configured", async () => {
    process.env.OPENROUTER_API_KEY = "valid-key";
    delete process.env.OPENROUTER_MODEL;

    await expect(extractBeliefFromText("ETH to 5000")).rejects.toThrow(
      "OPENROUTER_MODEL is not configured."
    );
  });

  it("should successfully extract relative performance belief", async () => {
    const mockLlmResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              subject: "SOL",
              comparison_asset: "ETH",
              direction: "OUTPERFORM",
              target_value: null,
              timeframe_days: 60,
              statement_summary: "SOL will outperform ETH over the next 60 days",
              oracle_recommendation: "chainlink",
              confidence_score: 0.92,
            }),
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockLlmResponse,
    });

    const request = new Request("http://localhost:3000/api/beliefs/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_text: "SOL is going to completely outperform ETH over the next 2 months",
        author_handle: "cryptowhale",
        source_url: "https://x.com/cryptowhale/status/123",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.subject).toBe("SOL");
    expect(json.data.comparison_asset).toBe("ETH");
    expect(json.data.direction).toBe("OUTPERFORM");
    expect(json.data.timeframe_days).toBe(60);
    expect(json.data.confidence_score).toBe(0.92);
  });

  it("should successfully parse LLM response wrapped in markdown codeblocks", async () => {
    const mockContent = "```json\n" + JSON.stringify({
      subject: "ETH",
      comparison_asset: null,
      direction: "ABOVE_PRICE",
      target_value: 5000,
      timeframe_days: 30,
      statement_summary: "ETH will exceed $5000 in 30 days",
      oracle_recommendation: "chainlink",
      confidence_score: 0.88,
    }) + "\n```";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: mockContent } }],
      }),
    });

    const request = new Request("http://localhost:3000/api/beliefs/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_text: "ETH will definitely pass $5000 in 30 days mark my words",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.subject).toBe("ETH");
    expect(json.data.target_value).toBe(5000);
    expect(json.data.direction).toBe("ABOVE_PRICE");
  });

  it("should return HTTP 400 for empty or invalid input payload", async () => {
    const request = new Request("http://localhost:3000/api/beliefs/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_text: "   ",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toBeDefined();
  });

  it("should return HTTP 502 when OpenRouter API fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const request = new Request("http://localhost:3000/api/beliefs/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_text: "Bitcoin will hit 100k by December",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(502);

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("AI provider error");
  });

  it("should return HTTP 422 when LLM output cannot be parsed into valid belief schema", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                subject: "",
                direction: "INVALID_DIRECTION",
              }),
            },
          },
        ],
      }),
    });

    const request = new Request("http://localhost:3000/api/beliefs/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_text: "Random opinion with no clear market assertion",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(422);

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Schema validation failed");
  });
});
