// WS client abstraction. In MOCK_MODE it emits simulated trade events.
// Swap to real WS by setting NEXT_PUBLIC_MOCK=false and pointing at the broker bridge.
import type { Trade } from "@genone/types";
import { tradeStream } from "@genone/mock-data";
import { MOCK_MODE, API_BASE_URL } from "../api/api-client";

export type WsEvent =
  | { type: "trade"; payload: Trade }
  | { type: "equity"; payload: { accountId: string; equityCents: number; pnlCents: number } }
  | { type: "status"; payload: { accountId: string; status: string } };

type Listener = (e: WsEvent) => void;

export function connectWs(accountId: string, listener: Listener): () => void {
  if (MOCK_MODE) return connectMock(accountId, listener);

  const url = `${API_BASE_URL.replace(/^http/, "ws")}/ws?accountId=${accountId}`;
  let socket: WebSocket | null = null;
  let closed = false;
  let attempts = 0;
  const open = () => {
    socket = new WebSocket(url);
    socket.onmessage = (e) => {
      try { listener(JSON.parse(e.data) as WsEvent); } catch { /* swallow */ }
    };
    socket.onclose = () => {
      if (closed) return;
      attempts++;
      setTimeout(open, Math.min(15_000, 500 * 2 ** attempts));
    };
    socket.onopen = () => { attempts = 0; };
  };
  open();
  return () => {
    closed = true;
    socket?.close();
  };
}

function connectMock(accountId: string, listener: Listener): () => void {
  const stream = tradeStream(accountId);
  let stopped = false;
  const tick = () => {
    if (stopped) return;
    const trade = stream.next().value;
    if (trade) listener({ type: "trade", payload: trade });
    // schedule next 5-10s
    setTimeout(tick, 5_000 + Math.random() * 5_000);
  };
  // first event after 3s so UI has time to mount
  setTimeout(tick, 3_000);
  return () => { stopped = true; };
}
