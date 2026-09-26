import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import HomePage from "@/app/page";

const MARKET = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Will BTC trade at or above $100,000 before Dec 21, 2026?",
  chain_id: 46630,
  contract_address: "0x087E3564f2f2B3383ad051de40b274e615A51942",
  agree_pool: 3,
  disagree_pool: 1,
  participants_count: 2,
  open_time: "2026-09-26T00:00:00.000Z",
  close_time: "2026-12-21T23:59:59.000Z",
  created_at: "2026-09-26T00:00:00.000Z",
  resolution_type: "PRICE_ABOVE",
  resolution_config: { asset: "BTC", targetPrice: 100000 },
  belief: {
    author: "@yes2crypto.eth",
    source_platform: "farcaster",
    source_url: "https://farcaster.xyz/yes2crypto.eth/0xabc",
    source_timestamp: "2026-09-20T00:00:00.000Z",
    sources: [{ raw_text: "Next target is 100K - Can happen quite fast" }],
  },
};

const CREATOR = {
  wallet_address: "0x1111111111111111111111111111111111111111",
  handle: "@yes2crypto.eth",
  display_name: "Yes2Crypto",
  avatar_url: null,
  total_beliefs_count: 2,
  resolved_count: 0,
  correct_count: 0,
};

function mockApi({ markets = [MARKET], creators = [CREATOR], fail = false } = {}) {
  vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
    if (fail) return Promise.resolve({ ok: false, status: 500, json: async () => ({}) } as Response);
    const u = String(url);
    const body = u.includes("/api/markets")
      ? { markets }
      : u.includes("/api/creators")
        ? { data: creators }
        : { stats: { active_markets: markets.length, total_beliefs: 5, verified_creators: creators.length, total_tvl_eth: "4.00" } };
    return Promise.resolve({ ok: true, json: async () => body } as Response);
  });
}

describe("Landing page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the headline and CTAs pointing at real destinations", () => {
    mockApi();
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1, name: /put a price on every public call/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /read today's calls/i })).toHaveAttribute("href", "#feed");
    expect(screen.getAllByRole("link", { name: /submit a call/i })[0]).toHaveAttribute("href", "/create");
  });

  it("shows stats from the API instead of hardcoded numbers", async () => {
    mockApi();
    render(<HomePage />);
    await waitFor(() => expect(screen.getByText("Calls tracked").nextSibling?.textContent).toBe("5"));
    expect(screen.getByText("Live markets").nextSibling?.textContent).toBe("1");
  });

  it("pairs each scanned post with its market and links to it", async () => {
    mockApi();
    render(<HomePage />);
    expect((await screen.findAllByText(/Next target is 100K/)).length).toBeGreaterThan(0);
    const marketLinks = screen.getAllByRole("link").filter((a) => a.getAttribute("href") === `/market/${MARKET.id}`);
    expect(marketLinks.length).toBeGreaterThan(1);
    expect(screen.getAllByText("75%").length).toBeGreaterThan(0);
  });

  it("walks through one real market with its contract on the explorer", async () => {
    mockApi();
    render(<HomePage />);
    expect(await screen.findByRole("heading", { name: /one call, start to finish/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view the contract/i })).toHaveAttribute(
      "href",
      expect.stringContaining(`/address/${MARKET.contract_address}`)
    );
  });

  it("lists predictors with an honest record when nothing has settled", async () => {
    mockApi();
    render(<HomePage />);
    expect(await screen.findByText("Yes2Crypto")).toBeInTheDocument();
    expect(screen.getByText("No calls settled yet")).toBeInTheDocument();
  });

  it("shows empty states when there are no markets or predictors", async () => {
    mockApi({ markets: [], creators: [] });
    render(<HomePage />);
    expect(await screen.findByText(/no live markets yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no predictors are being tracked yet/i)).toBeInTheDocument();
  });

  it("shows an error state with a working retry", async () => {
    mockApi({ fail: true });
    render(<HomePage />);
    const retry = await screen.findByRole("button", { name: /try again/i });
    mockApi();
    fireEvent.click(retry);
    expect((await screen.findAllByText(/Next target is 100K/)).length).toBeGreaterThan(0);
  });
});
