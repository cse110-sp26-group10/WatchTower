import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import "dotenv/config";

// Node 20 has no native WebSocket; supabase-js builds a Realtime client at
// startup, so provide `ws` as the transport. (Not needed on Node 22+.)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { realtime: { transport: ws } },
);
