# Use PostgreSQL for Database

## Context and Problem Statement

The WatchTower platform requires a robust, centralized database to store configuration data, analytical metrics, user permissions, and structured audit logs. As the service scales, we need a solution that guarantees transactional integrity (ACID) for relational structures while remaining flexible enough to handle varied and evolving operational payload formats without constant schema migrations. Should we prioritize a traditional relational database engine or a document-oriented model to balance structured relational integrity with semi-structured payload flexibility?

## Considered Options

* PostgreSQL (Object-Relational DBMS with native JSONB support)
* MongoDB (Document-Oriented NoSQL Database)

## Decision Outcome

Chosen option: **"PostgreSQL"**, because it provides the optimal balance between relational consistency and schemaless flexibility via its mature `jsonb` data type. While MongoDB natively handles unstructured documents, PostgreSQL allows us to maintain strict foreign-key relations, strong consistency guarantees, and relational data integrity across core entities while effortlessly indexing, querying, and formatting flexible JSON data structures where required. This eliminates the need to maintain an exclusively document-based schema or sacrifice relational safety.

## Consequences

* **Good, because:** We achieve seamless handling of dynamic metadata payloads using `jsonb` indexing capabilities (such as GIN filters) without abandoning SQL standard relational mechanics.
* **Good, because:** Operational management, query construction, and cross-table reporting are significantly simplified under a unified SQL parser.
* **Bad, because:** Writing advanced queries that manipulate deeply nested `jsonb` arrays can sometimes lead to more complex, syntax-heavy SQL expressions compared to MongoDB's native aggregation pipeline.
* **Bad, because:** Scale-out architecture (sharding) requires more deliberate infrastructure planning compared to MongoDB's built-in horizontal clustering.