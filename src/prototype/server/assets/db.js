import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import "dotenv/config";

// A one-time client will be created when dealing with sign-ups, sign-ins, and sign-outs
export const newClient = () => {
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { realtime: { transport: ws } }
    );
};

// Node 20 has no native WebSocket; supabase-js builds a Realtime client at
// startup, so provide `ws` as the transport. (Not needed on Node 22+.)
export const supabase = newClient();
