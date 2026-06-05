# Use PostgreSQL for Database

## Context and Problem Statement

WatchTower needs a database to store events, uptime logs, and user data. We expected the event schema to stay mostly fixed (event type, timestamp, project ID) but the metadata payload attached to each event could vary significantly depending on what the tracker captures. We needed something that handles structured relational data without forcing us to redesign the schema every time the payload shape changed.

## Considered Options

* PostgreSQL (relational, with JSONB support for flexible columns)
* MongoDB (document-oriented, schema-free)

## Decision Outcome

Chosen option: "PostgreSQL", because it covers both needs at once. Core entities like projects, events, and users stay in normal relational tables with foreign keys and strict types, while variable metadata goes into a JSONB column that can be queried and indexed without a schema migration every time the payload changes. MongoDB would handle the flexible data fine but gives up the relational guarantees we rely on for user-project relationships and event ordering.

### Consequences

* Good, because we get foreign key constraints and relational integrity for the parts of the schema that shouldn't change
* Good, because JSONB lets us store variable event metadata without altering the schema
* Good, because the team already knows SQL, so there is no extra learning curve
* Bad, because deeply nested JSONB queries get verbose compared to MongoDB's aggregation pipeline
* Bad, because horizontal scaling requires more planning than MongoDB's built-in sharding
