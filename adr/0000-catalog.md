# ADR-NNN: Catalog Editing and Search

**Status:** Proposed
**Date:** 2026-11-20
**Depends on:** ADR-005
**Related:** source-cooperative/source.coop#767 and #768 (keyword edit endpoint), metadata-catalog-pipeline#110 (human-in-the-loop redraft)

---

Currently, primary knowledge of the Products comes from Dynamo DB. Catalog artifacts are derived from the stored in the [Github `metadata-catalog` repository](https://github.com/source-cooperative/metadata-catalog). Neither provide a rich search-based discovery interface. Nor do either provide integrity checks within the data (e.g. ensuring `tag` elements are from a sanctioned set).

I propose that we make the catalog the sole source of truth for Products. In service of this, we should utilize a relational database management system (RDBMS) for operating the catalog. 

## `metadata-catalog-pipeline`

Today, the metadata catalog manages the lifecycle of catalog entries. Instead, its scope will be reduced to augmenting active (ie non-disabled) catalog entries. It performs this role in two ways: observations and suggestions.

### Observations

Observations are observed quantitative facts about a data product. For example, object count, byte volume, the distribution of files by types, date of last object write. Today, they are retrieved from parsing AWS S3 Inventory reports.

In the future, we should expand observation sourcing to other providers on a best-effort basis, such as:
* [GCS Inventory reports](https://docs.cloud.google.com/storage/docs/insights/inventory-reports)
* [Azure Blob Inventory](https://learn.microsoft.com/azure/storage/blobs/blob-inventory)
* [R2 Metrics](https://developers.cloudflare.com/r2/platform/metrics-analytics/)

The `metadata-catalog-pipeline` should be capable of contributing observations about a particular product **without the need for approval but a Product's maintainer**.

Consideration should be given to crafting a data model capable of supporting various levels of detail provided by varying observational sources.

### Suggestions

Suggestions are ways in which the metadata catalog pipeline (or perhaps even users) can suggest alterations to an existing Product metadata. Only a Product's maintainer is capable of accepting and applying Suggestions.

Each suggestion will store which catalog entry attribute is to be changed, how it is to be changed (e.g. replace, append, remove), who created the suggestion and when, an optional reasoning text field, and optional fields to track who approved the suggestion and when.

## STAC

Along with supporting direct SQL edits via the source.coop frontend/api, the catalog will be exposed via a read-only STAC API. Conforming to the STAC specification will bring greater interoperability with the greater STAC ecosystem, allowing external applications (eg STAC Browser) to explore Source Cooperative data products without customization.

> [!TIP]
> See https://browser.moregeo.it/external/catalog-search.alukach.workers.dev/ for an example of navigating Source Cooperative data products with STAC Browser, based on a naive import of the `metadata-catalog.jsonl`

If deemed necessary, artifacts of the STAC catalog will be generated on a regular interval and distributed via a Source Cooperative meta-product (source.coop/source/metadata-catalog) in various formats (JSONL, flat JSON files, geoparquet).

### How the Catalog builds a STAC Collection

| STAC Collection field | Source |
|---|---|
| `title`, `description`, `license`, `keywords`, `providers` | `products` and its related tables |
| `extent.spatial.bbox` | latest observation `bbox` |
| `extent.temporal.interval` | latest observation `datetime_range` |
| `summaries`, `assets` | other latest observations |

## Technical Architecture

### RDBMS

The catalog runs on SQLite hosted in Cloudflare D1, in a single database. We chose a relational database for three reasons:

- **Integrity.** Foreign keys, `CHECK` constraints and triggers enforce rules that the current stores cannot. For example, a `tag` must come from the sanctioned set.
- **Search.** FTS5 gives ranked free-text search over title, description and keywords. R*Tree indexes give spatial queries. Ordinary indexes cover temporal ranges and CQL2 filters. The `catalog-search` proof of concept already does all of this.
- **Transactions.** An accepted suggestion changes the product, records the decision and writes the audit event in one transaction.

D1 enforces foreign keys by default. A D1 database processes writes one at a time and has a size limit. Metadata volume is small, so one database is enough to start. Check Cloudflare's current limits as the catalog grows.

#### Limitations
D1 is a fully managed SQLite database. It has the following limitations.

| Limit                         | Value                                                                                                                  | Why it matters for the catalog                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Concurrency                   | One query at a time per database. Throughput is about `1 / average query time`.                                        | Slow searches block edits and other searches. This is the main constraint.                                    |
| Maximum database size         | 10 GB per database (Workers Paid). It cannot be raised.                                                                | Enough for products and suggestions. Keep README text out of D1, and add a retention rule for `observations`. |
| Maximum query duration        | 30 seconds. A query that uses too much CPU gets the database reset.                                                    | An unbounded CQL2 filter must not be able to run that long.                                                   |
| Maximum query result size     | 50 MB (enforced since 2026-11-04).                                                                                     | Page all lists and exports. Never select the full `doc` or README in list queries.                            |
| Overload behavior             | Requests queue. When the queue is full, D1 returns an "overloaded" error.                                              | A crawler burst can produce errors. Cache product-page reads.                                                 |
| Transactions                  | No interactive transactions. Atomic writes use `db.batch()`. (From D1's design, not re-checked.)                       | "Accept suggestion" must be one batch with a guarded version check.                                           |
| Queries per Worker invocation | A `db.batch()` counts as one query. Many separate queries in one invocation fail.                                      | Group related statements into one batch.                                                                      |
| `LIKE` / `GLOB` pattern       | 50 bytes.                                                                                                              | Validate CQL2 `LIKE` patterns and return a 400. Use FTS5 for text search.                                     |
| SQL statement length          | 100 KB per statement.                                                                                                  | Bulk loads need many smaller statements.                                                                      |
| Restore                       | Time Travel to any minute in the last 30 days. A restore overwrites the database in place. 10 restores per 10 minutes. | The main backup. Keep an R2 export for anything older than 30 days.                                           |
| Export                        | A database with FTS5 or R*Tree tables needs a special export option. That dump cannot be imported back into D1.        | Treat FTS and R*Tree as rebuildable. Export base tables only.                                                 |
| Read replicas                 | Only through the Sessions API and the Worker binding. They are asynchronous.                                           | Use them for search. Use a bookmark so editors see their own edits.                                           |
| Maximum import file           | 5 GB.                                                                                                                  | Not a problem at this scale.                                                                                  |
| Storage per account           | 1 TB (can be raised on request).                                                                                       | Not a problem.                                                                                                |
| Databases per account         | Up to 1,000,000. The first 100,000 are included.                                                                       | Per-account databases are possible if you split later.                                                        |

> [!NOTE]
> Despite D1s limitations, I believe that its offering as a fully managed RDBMS for little-to-no cost is worth exploring. If we outgrow the solution at a later date, I believe that we can migrate to a more classic RDBMS like Postgres with minimal effort.
##### Reads and replicas

D1 has one primary copy of the database. The primary handles all writes. A D1 database is single-threaded and runs one query at a time. A slow query makes every other query wait. Throughput is about `1 / average query time`. A 1 ms query allows about 1,000 queries per second. A 100 ms query allows about 10.

Search queries use FTS5 and R*Tree and can take 10 to 100 ms. If search shares the primary with writes, a burst of searches slows edits and suggestion decisions. We use three measures to prevent this.

###### 1. Cache product-page reads

Product pages read a few fields by primary key. These queries are fast, but traffic is bursty. In one sampled hour, `source.coop` handled 927 function requests. The busiest minute had 440. The busiest second had 71. A crawler walking one product can create such a burst. The app caches product metadata (for example with Next.js revalidation). A burst then mostly does not reach D1.

###### 2. Send search to read replicas

D1 can keep read-only copies of the database in several regions. We turn on read replication for the database. We call D1 through the [Sessions API](https://developers.cloudflare.com/d1/best-practices/read-replication/) in the Worker. Without the Sessions API, all queries go to the primary.

| Request type                               | Session                 | Why                                                           |
| ------------------------------------------ | ----------------------- | ------------------------------------------------------------- |
| Anonymous search and list                  | `withSession()`         | Any copy is acceptable. A few seconds of lag does not matter. |
| Editor views a Product or the review queue | `withSession(bookmark)` | The editor must see their own edits.                          |
| Any write                                  | The normal binding      | All writes go to the primary.                                 |

Replicas copy changes from the primary after a short delay. A session carries a **bookmark**, a marker for a point in the database history. A replica answers only if it is at least that current. After a write, the Worker returns the new bookmark to the client (in a response header or cookie). The client sends it with the next request, and the Worker starts the session with it. The editor then sees their own edit on the next page load.

Limits:
- Replication improves read capacity and latency. It does not improve write capacity.
- Each replica is single-threaded too. A burst of slow searches still queues, but the queue is spread across copies.
- The Sessions API works only through the Worker binding. It does not work through the REST API.
- There is no extra cost. Billing depends on rows read and written.

###### 3. Bound the cost of a search

- Set a default `limit` of 10 and a maximum of 100.
- Allow CQL2 filters only on indexed columns. Reject other properties with a 400 response.
- Add a rate limit for anonymous search.
- Never return `SELECT *` or full STAC `doc` bodies in list results. D1 fails any query result larger than 50 MB.
- Page all exports.

### Tables

#### `products`

One row per product. This is the source of truth for editor-owned metadata.

> [!IMPORTANT]
> The below schema represents a crude first-pass concept of the table shape. We should better settle in on a design once this general idea is agreed upon.

```sql
products(
  id            TEXT PRIMARY KEY,            -- 'account_id/product_id'
  account_id    TEXT NOT NULL,
  product_id    TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  license       TEXT,                        -- SPDX id
  doi           TEXT CHECK (doi IS NULL OR doi GLOB '10.*/*'),
  visibility    TEXT NOT NULL CHECK (visibility IN ('public','unlisted','restricted')),
  disabled      INTEGER NOT NULL DEFAULT 0,
  featured      INTEGER NOT NULL DEFAULT 0,
  version       INTEGER NOT NULL DEFAULT 1,  -- optimistic concurrency
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  UNIQUE (account_id, product_id)
)
```

Related tables:

- `product_mirrors(product_id, connection_id, prefix, is_primary)` replaces the mirrors that sit in the DynamoDB `metadata` blob.
- `product_providers(product_id, name, roles, url)` holds STAC providers.

Search indexes are `products_fts` (title, description, keywords), `products_bbox` (R*Tree) and the datetime columns, as in `catalog-search`. The write path keeps them in step with `products`. They replace the DynamoDB `search_text` workaround.

#### `keywords`

The controlled vocabulary. Formerly known as "Tags" but renamed for better adherence to STAC convention.

> [!IMPORTANT]
> The below schema represents a crude first-pass concept of the table shape. We should better settle in on a design once this general idea is agreed upon.

```sql
keywords(
  term         TEXT PRIMARY KEY,
  description  TEXT,
  status       TEXT NOT NULL CHECK (status IN ('permitted','suggested')),
  suggested_by TEXT,
  promoted_by  TEXT,
  promoted_at  TEXT
)
```

A new term starts as `suggested`. A suggestion can propose it, but a product cannot use it. A catalog administrator promotes it to `permitted`.

#### `product_keywords`

A many-to-many link from products to keywords.

> [!IMPORTANT]
> The below schema represents a crude first-pass concept of the table shape. We should better settle in on a design once this general idea is agreed upon.

```sql
product_keywords(
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  term       TEXT NOT NULL REFERENCES keywords(term),
  PRIMARY KEY (product_id, term)
)
```

The foreign key blocks unknown terms. A trigger also rejects any term whose `status` is not `permitted`.

#### `suggestions`

AI and user-sourced suggestions.

> [!IMPORTANT]
> The below schema represents a crude first-pass concept of the table shape. We should better settle in on a design once this general idea is agreed upon.

```sql
suggestions(
  id            TEXT PRIMARY KEY,
  product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  account_id    TEXT NOT NULL,        -- copied from the product; eases a later split
  attribute     TEXT NOT NULL,        -- 'description', 'keywords', 'license', ...
  op            TEXT NOT NULL CHECK (op IN ('replace','append','remove')),
  value         TEXT NOT NULL,        -- JSON
  reasoning     TEXT,
  created_by    TEXT NOT NULL,        -- user id, or 'pipeline:<name>'
  created_at    TEXT NOT NULL,
  base_version  INTEGER NOT NULL,     -- products.version when proposed
  input_hash    TEXT,                 -- what the pipeline read to propose it
  status        TEXT NOT NULL CHECK (status IN ('pending','accepted','rejected','stale')),
  decided_by    TEXT,
  decided_at    TEXT
)
-- index: (product_id, status)
```

A suggestion is `stale` when `products.version` has moved past `base_version`. A rejected suggestion with the same `input_hash` is not proposed again. Accepting a suggestion is one transaction: it updates `products`, bumps `version`, marks the suggestion `accepted` and writes a `product_events` row.

#### `observations`

Measured values from the pipeline and from maintainers.

> [!IMPORTANT]
> The below schema represents a crude first-pass concept of the table shape. We should better settle in on a design once this general idea is agreed upon.

```sql
observations(
  id          INTEGER PRIMARY KEY,
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  account_id  TEXT NOT NULL,
  key         TEXT NOT NULL,              -- 'object_count', 'bbox', 'ext_histogram', ...
  value       TEXT NOT NULL,              -- JSON
  source      TEXT NOT NULL,              -- 's3-inventory','gcs-inventory','azure-inventory','r2-metrics','probe','maintainer'
  scope       TEXT NOT NULL DEFAULT '',   -- prefix the value covers; '' means the whole product
  coverage    TEXT NOT NULL CHECK (coverage IN ('complete','sampled','estimate')),
  evidence    TEXT,                       -- snapshot id, sample size, query
  observed_at TEXT NOT NULL
)
-- index: (product_id, key, observed_at)
```

`source`, `scope` and `coverage` carry the different levels of detail from different providers:

- An S3 inventory gives a `complete` count for the whole product.
- A probe of ten files gives a `sampled` datetime range.
- R2 metrics may give only an `estimate` of bytes.

Search and the Product page read the latest observation for each `(product_id, key)`. The latest row has the greatest `observed_at`. The `id` breaks ties. An index on `(product_id, key, observed_at)` serves this query.

#### `product_events`

An append-only audit log. Each row records who changed what, when, the old and new value, and the source (`user`, `accepted-suggestion`, `migration`). Triggers or the write path can fill it. The choice depends on research into D1 audit patterns.

### Visibility

The database holds all products, including private and unlisted ones. Every query adds `visibility = 'public' OR account_id IN (caller's accounts)`. The Worker applies this filter. The client never does. The app passes the caller's accounts to the Worker in a signed token.

### Splitting later

`suggestions` and `observations` carry `account_id` so they can move to per-account databases if write volume demands it. Accepting a suggestion would then cross two databases. D1 has no transaction across databases. If that happens, apply the change to the primary database first, using the suggestion id as an idempotency key. Then mark the suggestion `accepted`. A reconcile job closes any suggestion left `pending` after its change was applied.
