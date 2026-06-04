# Use Supabase for User Authentication
## Context and Problem Statement

WatchTower requires a user authentication system to control access to the application. The team needed to decide how to implement login, session management, and user identity — while keeping the stack cohesive and minimizing the overhead of maintaining a separate auth service. Since WatchTower already uses Supabase as its primary data store, the question was whether to extend that existing integration or introduce a separate authentication provider.

## Considered Options

* Supabase Auth (built-in authentication via the existing Supabase project)
* Firebase Authentication (Google-managed auth-as-a-service)
* Custom JWT-based authentication (self-managed tokens and session logic)

## Decision Outcome

Chosen option: **Supabase Auth**, because WatchTower already uses Supabase for data storage, meaning the infrastructure, client library, and project configuration are already in place. Adding authentication through the same Supabase project requires no additional service setup, keeps credentials and user data co-located, and reduces the cognitive overhead of managing a second platform.

### Consequences

* Good, because the `@supabase/supabase-js` client already imported for data access handles auth too — no new SDK or dependency needed.
* Good, because user identity (e.g. `user.id`) is natively available when querying the database, making it straightforward to implement row-level security (RLS) policies later if needed.
* Good, because session management (token refresh, persistence) is handled automatically by the Supabase client.
* Good, because the Supabase dashboard gives the team a single place to inspect users, sessions, and data during development and debugging.
* Bad, because the project becomes more tightly coupled to Supabase — migrating away in the future would require replacing both auth and data layers simultaneously.
* Bad, because Supabase Auth's free tier has limits (e.g. monthly active users) that could become a constraint if WatchTower scales beyond a class project context.
