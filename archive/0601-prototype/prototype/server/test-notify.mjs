// Throwaway manual test for the notification backend. Delete when done.
//
// Usage:
//   node test-notify.mjs                 # sends to topic "WatchTower_test"
//   node test-notify.mjs <ntfy-topic>    # sends to a topic of your choice
//
// Calls the real notify() path: pushes to the given ntfy topic and (if local
// Supabase is running) emails a copy to the seeded user's address. Use a topic
// your phone is already subscribed to so you can confirm receipt.

import { notify } from "./assets/notify.js";
import { supabase } from "./assets/db.js";

const topic = process.argv[2] || "WatchTower_test";
const SEEDED_AUTH_ID = "43ec5a9a-74bb-460a-b368-4767846455e0";
const TEST_EMAIL = "xuw040@ucsd.edu";


await supabase.auth.admin.updateUserById(SEEDED_AUTH_ID, { email: TEST_EMAIL });
const user = { alert_id: topic, auth_id: SEEDED_AUTH_ID };

console.log(`Sending test alert to ntfy topic "${topic}"...`);
const ok = await notify(user, {
    title: "Error on example.com",
    message: "[high] Manual test error from test-notify.mjs\nhttps://example.com/checkout",
    priority: "high",
    tags: ["rotating_light"]
});
console.log(ok ? "Sent. Check your phone and the user's inbox." : "Failed - see errors above.");
process.exit(0);
