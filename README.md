
# Mono Bank Availability Service (BAS)

> Near‑real‑time uptime tracker for Nigeria‑Inter‑Bank Payment rails  
> **NodeJS · PostgreSQL · Redis · Docker**


## Stack

| Layer            | Choice                                | Why                                                                                |
|------------------|---------------------------------------|------------------------------------------------------------------------------------|
| **Runtime**      | Node 20 × NestJS 10                   | NestJS lets me focus on writing features instead of wiring plumbing. TypeScript, Dependency Injection, and schedulers are all sitting there ready to go. I get prototype-level speed, but the folder structure and patterns still feel like what big production teams run, so whatever I build today stays easy to grow tomorrow.                     |
| **DB**           | PostgreSQL 15 (Prisma ORM)            | ACID storage, simple migrations, composite unique index                            |
| **Cache**        | Redis (Nest Cache, Keyv driver)     | Sub‑10 ms look‑ups. TTL has been configured to match our polling intervals.                                      |
| **Container**    | Docker + Docker Compose            | Entire stack in one command — zero local toolchain needed                          |
| **Testing**      | Jest + Supertest                      | Fast unit + E2E suites                                                             |

---

## Quick Start

```bash
# clone & run everything (API + Postgres + Redis) in one shot
git clone https://github.com/edwardoboh/mono-bank-availability.git
cd mono-bank-availability
docker compose up --build
```

<details>
<summary>What happens under the hood?</summary>

* **`Dockerfile`** installs deps, builds the app, then runs `prisma migrate deploy`  
  so the schema is applied automatically on first start‑up.  
* **`docker-compose.yml`** spins up  
  * **api**  → NodeJs application  
  * **db**   → PostgreSQL  
  * **cache** → Redis  
* Pollers begin populating `bank_availability` within < 5 min.
</details>

---

## Environment Variables

| Key | Default | Purpose |
|-----|---------|---------|
| `DATABASE_URL` | `postgresql://...5432/testdb` | Database conection string |
| `REDIS_URL`    | `redis://...:6379`                         | Cache store URL|
| `BANK_CODES`   | `NIP001,…,NIP030`                            | Master bank list |
| `WINDOW_1H_POLL_MS` | `300000`  | Poll interval for 1 h window |
| `WINDOW_6H_POLL_MS` | `900000`  | for 6 h |
| `WINDOW_24H_POLL_MS`| `3600000` | for 24 h |
| `CONF_LOW_MAX` / `CONF_MED_MAX` | `10` / `50` | Confidence thresholds |
| `API_KEY` | `averysecret...xyz` | Sent as `x-api-key` header |


For convenience, the repo comes with a **`.env`** file so you can spin everything up in a single `docker compose up` command. All variables are type‑checked at boot by `env-validation.config.ts`.

> In production, real credentials must never be commited to source control. A better approach would be to **keep secrets in a dedicated vault** like AWS Secrets Manager or Azure Key Vault and have our runtime platform inject them into the container’s environment **after the image starts** (so the image remains generic), and sensitive data is pulled securely at launch time rather than hard coded in the repo.




---

## API Reference & Examples

| Verb | Path | Description | Auth |
|------|------|-------------|------|
| GET | `/health` | Liveness probe | none |
| GET | `/banks/availability?window=1h` | All banks for window | `x-api-key` |
| GET | `/banks/:bank_nip_code/availability?window=6h` | Single bank | `x-api-key` |

```bash
API=http://localhost:3000
KEY="averysecretapikey323gxyz"

# All banks, 1‑hour view
curl -H "x-api-key: $KEY" "$API/banks/availability?window=1h"

# Bank NIP014, 6‑hour view
curl -H "x-api-key: $KEY" "$API/banks/NIP014/availability?window=6h"
```

> For ease of testing the API endpoints, below is a link to a Postman documentation that you can easily import and make requests from your local machine: <br />
> https://documenter.getpostman.com/view/26872449/2sB2qgfz7q

---

## Running Test

```bash
docker compose run --rm api npm test
```
Runs Jest unit + E2E suites inside the container; coverage saved to `/coverage`.

---

## Architectural Overview

![Image of Arch. overview from spec document](https://github.com/edwardoboh/assets/blob/main/Screenshot%202025-06-02%20at%2023.47.49.png?raw=true)

### High-level flow

1. **AvailabilityService** owns the scheduler.  
   Every `WINDOW_*_POLL_MS` interval it calls `processWindow('1h' | '6h' | '24h')`.
2. For each bank code it asks **TransactionSource** for an already-aggregated
   status-count object.  
   Today that source is a file-backed mock (`transactions.json`), but the
   interface is thin enough to swap in a Kafka consumer or HTTP client later.
3. The counts are normalised into an availability percentage and written to
   PostgreSQL via Prisma’s `upsert` (composite key: `bank_nip_code + time_window`).
4. Read traffic hits **BanksController**.  
   The controller delegates to **BanksService**, which fetches the latest
   availability row. A Nest **CacheInterceptor** puts the JSON response into
   Redis for a duration <= poll interval, cutting down latency to
   single-digit milliseconds.

### Codebase structure

| Folder | What lives there | Notes |
|--------|------------------|-------|
| `src/app.module.ts` | Root wiring | Imports Config, Schedule and all feature modules |
| `src/availability` | **AvailabilityModule** + service | Scheduler, confidence calculation, DB upserts |
| `src/transaction-source` | **TransactionSource** interface & file-based impl | Swap here to move from mock → real stream |
| `src/banks` | Controller + service | REST endpoints (`/banks…`) |
| `src/auth` | `ApiKeyGuard` | Simple header-based auth |
| `src/common/config` | Typed config + Joi validation | Pulls everything from `.env` |
| `src/health` | `/health` controller | Plain JSON liveness probe |
| `prisma/` | Schema & migrations | Composite index enforces one row per window |
| `test/` | Jest E2E & unit tests | Runs in the same Docker image |

---

## Design Decisions & Trade‑offs

| Topic | Decision | Rationale |
|-------|----------|-----------|
| **All‑in‑Docker** | No host toolchain required | Simplest onboarding; parity with CI |
| **Dynamic poll intervals** | Timers registered via `SchedulerRegistry` using values from `.env` | Tweak rates without rebuild |
| **Redis cache** | TTL ≤ shortest poll interval | Guarantees freshness; 85 % faster TTFB |
| **Composite key** | `@@unique([bank_nip_code,time_window])` | Enforces single row per window |
| **Confidence buckets** | LOW / MED / HIGH | Avoid misleading stats on tiny samples |
| **API key guard** | Simple `x-api-key` header | Meets assessment needs; can be swapped for JWT/OIDC later |

---

## Reducing Latency with Redis

### Before Implementing Redis

![Before implementing Redis](https://github.com/edwardoboh/assets/blob/main/Screenshot%202025-06-01%20at%2013.28.25.png?raw=true)

| Run | TTFB | Total |
|-----|------|-------|
| Cold (DB) | 98 ms | 100 ms |
| Warm (DB) | 29.84.08 ms | 32 ms |

### After Implementing Redis

![Before Integrating Redis](https://github.com/edwardoboh/assets/blob/main/Screenshot%202025-06-01%20at%2013.29.24.png?raw=true)

| Run | TTFB | Total |
|-----|------|-------|
| Cold (DB) | 98 ms | 100 ms |
| Warm (Redis) | 3.61 ms | 5 ms |

#### Implementing Caching in the application reduced latency from ~32ms to ~5ms, which is an improvment of 85 % .
---

## Scalability & Further Discussion

The service is designed to be as stateless as possible: all persistent data lives in Postgres, while Redis handles short-lived cache entries. Because of that, spinning up more API replicas is mostly a matter of pointing a Load Balancer or a Kubernetes `Service` to a larger replica set. The only issue is the background pollers. In a multi-instance deployment we don’t want every replica running the loop on the same aggregated data. Two easy ways to resolve this is to either place the poller into a single CronJob/sidecar or letting each replica grab a lightweight distributed lock before it starts its work.

For real-time ingestion, switching from “poll and calculate” to a streaming model is really straightforward. Upstream systems would push raw transaction events onto a Kafka topic; a Kafka Streams application could maintain the 1 h, 6 h, and 24 h tumbling-window aggregates (basically breaking a long stream of events into 1h or 6h or 24h sections with non-overlapping events) keyed by `bank_nip_code`. Those pre-rolled counts can then be fanned out to Redis Streams or a compacted topic, and the Availability Service simply subscribes and upserts—no more polling, data arrives almost instantly.

Observability will matter more as load grows. Beyond the basic `/health` check, the service should track other things like time-series availability, processing lag (how far we are behind the latest event or poll), cache hit ratio, and how long each job cycle takes. Exposing those through Prometheus (or OpenTelemetry) makes it easy to spot issues long before consuming servicer feel the pain.

---
